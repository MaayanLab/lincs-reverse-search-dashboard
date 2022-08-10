import os
import anyio
import pathlib
import functools
import typing as t
import pandas as pd
from enum import Enum
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache

load_dotenv()
__directory__ = pathlib.Path(__file__).parent

# Types

GeneSymbol = t.NewType('GeneSymbol', str)

class DataKind(str, Enum):
  cp = 'cp'
  xpr = 'xpr'

class Direction(str, Enum):
  up = 'up'
  down = 'down'

# Utils

def anyio_to_thread_run_sync(fn):
  def wrapper(args, kwargs):
    return fn(*args, **kwargs)
  @functools.wraps(fn)
  async def async_fn(*args, **kwargs):
    return await anyio.to_thread.run_sync(wrapper, args, kwargs)
  return async_fn

# Helpers

root_path = os.environ.get('ROOT_PATH', 'https://appyters.maayanlab.cloud/storage/L1000_RNAseq_Gene_Search')

@cache()
@anyio_to_thread_run_sync
def gene_list():
  return pd.read_csv(f"{root_path}/L1000_to_RNAseq_gene_list.tsv", sep="\t", index_col=0).to_dict(orient='index')

def data_gene_df(kind: DataKind, gene: GeneSymbol):
  if kind == DataKind.xpr:
    return pd.read_feather(f"{root_path}/gene_files/{gene}.f").set_index('index')
  elif kind == DataKind.cp:
    return pd.read_feather(f"{root_path}/cp_gene_files/{gene}.f").set_index('index')
  else:
    raise HTTPException(status_code=404, detail='Not Found')

def data_gene_title(kind: DataKind):
  if kind == DataKind.xpr:
    return 'CRISPR KO'
  elif kind == DataKind.cp:
    return 'Chemical'
  else:
    raise HTTPException(status_code=404, detail='Not Found')

def make_plot(comb_df, gene: GeneSymbol, pert_type: DataKind):
    import matplotlib.colors as colors
    import matplotlib.cm as cm
    from bokeh.plotting import figure
    from bokeh.models import ColumnDataSource

    def map_color(cd, logfc, red_norm, blue_norm):
        v = cd*logfc

        if v < 0: 
            return '#D3D3D3'
        elif cd < 0:
            return colors.to_hex(cm.get_cmap('Reds')(red_norm(cd*logfc)))
        else:
            return colors.to_hex(cm.get_cmap('Blues')(blue_norm(cd*logfc)))
    
    # check if there are any results
    if comb_df.shape[0] == 0:
        raise HTTPException(status_code=406, detail='There are no signatures in the pre-processed dataset for the chosen gene, cell line, and perturbation type inputs.')

    # set color and size for each point on plot
    v = (comb_df['logFC']*comb_df['CD']).to_numpy()
    red_norm = colors.Normalize(vmin=min(v)-0.005, vmax=max(v)+0.005)
    blue_norm = colors.Normalize(vmin=min(v)-0.005, vmax=max(v)+0.005)

    plot_colors = [map_color(row.CD, row.logFC, red_norm, blue_norm) for row in comb_df.itertuples()]

    # generate data source
    data_source = ColumnDataSource(
        data=dict(
            x = comb_df['logFC'],
            y = comb_df['CD'].apply(abs),
            cd = comb_df['CD'],
            sig = pd.Series(comb_df.index),
            fc = comb_df['FC'], 
            logfc = comb_df['logFC'],
            colors = plot_colors, 
            sizes = [8] * comb_df.shape[0],
        )
    )

    # create hover tooltip
    tools = [
        ("Signature", "@sig"),
        ("CD Coeff", "@cd"),
        ("Fold Change", "@fc"),
        ("Log2 Fold Change", "@logfc")
    ]
    # generate plot and relevant plot labels
    plot = figure(
        plot_width=700,
        plot_height=500,
        tooltips=tools
    )
    
    plot.circle(
        'x', 'y', 
        size='sizes',
        alpha=0.7, 
        line_alpha=1,
        line_width=1, 
        line_color='colors',
        source=data_source,
        fill_color='colors', 
        name=f"{gene}_expression_in_L1000_to_RNAseq_{pert_type.replace(' ','')}_volcano_plot"
    )

    plot.yaxis.axis_label = 'Abs(CD-Coefficient)'
    plot.xaxis.axis_label = 'log2(Fold Change)'
    plot.title.text = f"Differential Expression of {gene} in RNA-seq-like {pert_type} Signatures"
    plot.title.align = 'center'
    plot.title.text_font_size = '14px'
    return plot

def bokkeh_plot_to_json(plot):
  from bokeh.embed import json_item
  return json_item(plot)

def make_tables(comb_df, pert: DataKind, direction: Direction):
    dir_df = comb_df[comb_df['FC'] > 1] if direction == Direction.up else comb_df[comb_df['FC'] < 1]
    if dir_df.shape[0] == 0: 
        raise HTTPException(status_code=406, detail=f"There are no {'up-regulated' if direction == Direction.up else 'down-regulated'} signatures for the chosen gene and cell line inputs.")
    dir_df = dir_df.sort_values(by='FC', ascending=direction == Direction.down)
    dir_df['FC'] = dir_df['FC'].apply(lambda x: f'{x:.4f}')
    dir_df['CD'] = dir_df['CD'].apply(lambda x: f'{x:.4f}')
    if pert == DataKind.xpr:
        dir_df['KO Gene'] = dir_df.index.map(lambda x: x.split('_')[4])
    else:
        dir_df['Perturbagen'] = dir_df.index.map(lambda x: x.split('_')[4])
        dir_df['Dose'] = dir_df.index.map(lambda x: x.split('_')[5] if len(x.split('_')) == 6 else '')
    dir_df['Cell Line'] = dir_df.index.map(lambda x: x.split('_')[1])
    dir_df['Timepoint'] = dir_df.index.map(lambda x: x.split('_')[2].lower())
    dir_df = dir_df.rename(columns={
            'FC': 'Fold Change', 
            'logFC': 'Log2(Fold Change)', 
            'CD': 'CD Coefficient',
            'Rank': 'Rank in Signature'})
    dir_df.index.names = ['Signature']
    return dir_df

# API

api = FastAPI()

@api.get('/info/')
async def info():
  G = await gene_list()
  return G

@api.get('/info/{gene}')
async def info_gene(gene: str):
  G = await gene_list()
  if gene not in G:
    raise HTTPException(status_code=404, detail='Gene not supported')
  return G[gene]

@api.get('/data/{kind}/{gene}')
@cache()
@anyio_to_thread_run_sync
def data_gene(kind: DataKind, gene: GeneSymbol):
  ''' Get data of a given kind for a given gene
  '''
  df = data_gene_df(kind, gene)
  return df.to_dict()

@api.get("/plot/{kind}/{gene}")
@anyio_to_thread_run_sync
def plot_kind_gene(kind: DataKind, gene: GeneSymbol):
  ''' Plot gene signatures of a given kind for a given gene
  '''
  df = data_gene_df(kind, gene)
  title = data_gene_title(kind)
  plot = make_plot(df, gene, title)
  return bokkeh_plot_to_json(plot)

@api.get("/table/{kind}/{direction}/{gene}")
@anyio_to_thread_run_sync
def table_kind_direction_gene(kind: DataKind, direction: Direction, gene: GeneSymbol, limit: t.Optional[int] = None):
  ''' Return a table of top direction-regulated genes from a given kind for a given gene
  '''
  df = data_gene_df(kind, gene)
  tbl = make_tables(df, pert=kind, direction=direction)
  if limit is not None:
    tbl = tbl.iloc[:limit]
  return tbl.to_dict()

# APP

mode = os.environ.get('MODE', 'development')

app = FastAPI()
app.mount('/api', api)

@app.on_event("startup")
async def startup():
  mem = InMemoryBackend()
  FastAPICache.init(mem)

if mode == 'development':
  @app.get('/{path:path}', response_class=FileResponse)
  def index(path: str):
    ''' Serve static files in development
    '''
    path = __directory__ / path
    if path.is_dir():
      path = path / 'index.html'
    return path
