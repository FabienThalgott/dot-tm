# -*- coding: utf-8 -*-

import pydot
import json
from collections import defaultdict
import csv
import sys
import argparse as ap

# Hardcoded json file to look for
data = json.load(open('example.json'))
    

## Create a new graph and extraxt values from json
graph = pydot.Dot(graph_type='digraph')
nodes = data.get('nodes')
processes = nodes.get('processes')
datastore = nodes.get('datastores')
entities = nodes.get('entities')
nestedboundaries = nodes.get('nestedboundaries')
edges = nodes.get('edges')
stridetable = defaultdict(dict)

#declare boundaries dict
boundaries = defaultdict(list)

#Generate all processes nodes
for key,value in processes.items():
    item = key
    for k,v in value.items():
        if k in "label":
            node =  pydot.Node(v)
            graph.add_node(node)
        if k in "boundary":
            boundaries[v].append(item)
  
#Generate all entities nodes
for key,value in entities.items():
    item = key
    for k,v in value.items():
        if k in "label":
            node =  pydot.Node(v, shape="box")
            graph.add_node(node)
        if k in "boundary":
            boundaries[v].append(item)
        

#Generate all datastore nodes
for key,value in datastore.items():
    item = key
    for k,v in value.items():
        if k in "label":
            node =  pydot.Node(v, shape="cylinder")
            graph.add_node(node)
        if k in "boundary":
            boundaries[v].append(item)
        

#Generate all edges and export stride analysis
for key,value in edges.items():
    edgefrom =""
    edgeto = ""
    spoofingdict = {}
    tamperingdict = {}
    repudiationdict= {}
    infodict = {}
    dosdict={}
    elevationdict={}
    for k,v in value.items():
        if k in "from":
            edgefrom = v
        if k in "to":
            edgeto = v
        if k in 'stride':
            spoofingdict = {key:v[key] for key in ['st1', 'sm1', 'st2', 'sm2', 'st3', 'sm3']}
            tamperingdict = {key:v[key] for key in ['tt1', 'tm1', 'tt2', 'tm2','tt3', 'tm3']}
            repudiationdict = {key:v[key] for key in ['rt1', 'rm1', 'rt2', 'rm2','rt3', 'rm3']}
            infodict = {key:v[key] for key in ['it1', 'im1', 'im2', 'it2', 'im3', 'it3']}
            dosdict = {key:v[key] for key in ['dt1', 'dm1', 'dt2', 'dm2','dt3', 'dm3']}
            elevationdict = {key:v[key] for key in ['et1', 'em1','et2', 'em2','et3', 'em3']}
            stridetable[edgefrom+';'+edgeto]['spoofing']=['Spoofing',spoofingdict['st1'],spoofingdict['sm1'],spoofingdict['st2'],spoofingdict['sm2'],spoofingdict['st3'],spoofingdict['sm3']]
            stridetable[edgefrom+';'+edgeto]['tampering']=['Tampering',tamperingdict['tt1'],tamperingdict['tm1'],tamperingdict['tt2'],tamperingdict['tm2'],tamperingdict['tt3'],tamperingdict['tm3']]
            stridetable[edgefrom+';'+edgeto]['repudiation']=['Repudiation',repudiationdict['rt1'],repudiationdict['rm1'],repudiationdict['rt2'],repudiationdict['rm2'],repudiationdict['rt3'],repudiationdict['rm3']]
            stridetable[edgefrom+';'+edgeto]['info']=['Information Disclosure',infodict['it1'],infodict['im1'],infodict['it2'],infodict['im2'],infodict['it3'],infodict['im3']]
            stridetable[edgefrom+';'+edgeto]['dos']=['Denial of Service',dosdict['dt1'],dosdict['dm1'],dosdict['dt2'],dosdict['dm2'],dosdict['dt3'],dosdict['dm3']]
            stridetable[edgefrom+';'+edgeto]['elevation']=['Elevation of privilege',elevationdict['et1'],elevationdict['em1'],elevationdict['et2'],elevationdict['em2'],elevationdict['et3'],elevationdict['em3']]
    graph.add_edge(pydot.Edge(edgefrom, edgeto))
   

# Export STRIDE to csv table
with open('stride.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile, delimiter=';',quotechar='',escapechar='\\', quoting=csv.QUOTE_NONE)
    writer.writerow(['sep=','']) #Forces excel to bypass system delimiter and use the provided one instead
    for key, value in stridetable.iteritems():
        edgefrom, edgeto = key.split(';')
        writer.writerow(['',edgefrom+' Threat',edgefrom+' Mitigation','Flow Threat','Flow Mitigation',edgeto+' Threat',edgeto+' Mitigation'])
        writer.writerow(value['spoofing'])
        writer.writerow(value['tampering'])
        writer.writerow(value['repudiation'])
        writer.writerow(value['info'])
        writer.writerow(value['dos'])
        writer.writerow(value['elevation'])
        writer.writerow('')
        



# Generate boundaries
clusters= defaultdict(list)
for key,values in boundaries.iteritems():
    cluster = pydot.Cluster(key,label=key, style='dashed', color='red',fontcolor='red')
    for item in values:
        cluster.add_node(pydot.Node(item,label=item))
    graph.add_subgraph(cluster)


#Finally generate the graph
graph.write_png('TM_graph.png')
print "Graph has been generated as TM_graph.png"
print "STRIDE has been exported to stride.csv"
