# -*- coding: utf-8 -*-
import pydot
import json
from collections import defaultdict
import csv
import sys
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("json")
filename='example.json'

try:
    args = parser.parse_args()
    filename=args.json
    data = json.load(open(args.json))
except:
    print 'No file given in command, defaulting to example.json'
    data = json.load(open(filename))


# Hardcoded json file to look for
#data = json.load(open('auth0.json'))
    

## Create a new graph and extract values from json
graph = pydot.Dot(graph_type='digraph')
nodes = data.get('nodes')
processes = nodes.get('processes')
datastore = nodes.get('datastores')
entities = nodes.get('entities')
nestedboundaries = nodes.get('nestedboundaries')
edges = nodes.get('edges')
nestedclusters = nodes.get('nestedclusters')
stridetable = defaultdict(dict)

#declare boundaries dict
clusters = defaultdict(list)
nclusters = {}
nclusters["root"] = graph

#Generate all processes nodes
for key,value in processes.items():
    item = key
    itemlabel=''
    lab = value['label']
    node = pydot.Node(lab, shape="circle")
    graph.add_node(node)
    clus =  value['cluster']
    clusters[clus].append(lab)
      
#Generate all entities nodes
for key,value in entities.items():
    item = key
    lab = value['label']
    node = pydot.Node(lab, shape="box")
    graph.add_node(node)
    clus =  value['cluster']
    clusters[clus].append(lab)
    
#Generate all datastore nodes
for key,value in datastore.items():
    item = key
    lab = value['label']
    node = pydot.Node(lab, shape="trapezium")
    graph.add_node(node)
    clus =  value['cluster']
    clusters[clus].append(lab)
 
#Generate all edges and export stride analysis
for key,value in edges.items():
    edgefrom = value['from']
    edgeto = value['to']
    spoofingdict = {}
    tamperingdict = {}
    repudiationdict = {}
    infodict = {}
    dosdict = {}
    elevationdict = {}
    isStride = False
    crossingboundary = ''
    label = value['label']
    for k,v in value.items():
        if k in 'stride':
            isStride = True
            crossingboundary = v['crossingboundary']
            spoofingdict = {key:v[key] for key in ['st1', 'sm1', 'st2', 'sm2', 'st3', 'sm3']}
            tamperingdict = {key:v[key] for key in ['tt1', 'tm1', 'tt2', 'tm2','tt3', 'tm3']}
            repudiationdict = {key:v[key] for key in ['rt1', 'rm1', 'rt2', 'rm2','rt3', 'rm3']}
            infodict = {key:v[key] for key in ['it1', 'im1', 'im2', 'it2', 'im3', 'it3']}
            dosdict = {key:v[key] for key in ['dt1', 'dm1', 'dt2', 'dm2','dt3', 'dm3']}
            elevationdict = {key:v[key] for key in ['et1', 'em1','et2', 'em2','et3', 'em3']}
            stridetable[edgefrom + ';' + edgeto]['spoofing'] = ['Spoofing',spoofingdict['st1'],spoofingdict['sm1'],spoofingdict['st2'],spoofingdict['sm2'],spoofingdict['st3'],spoofingdict['sm3']]
            stridetable[edgefrom + ';' + edgeto]['tampering'] = ['Tampering',tamperingdict['tt1'],tamperingdict['tm1'],tamperingdict['tt2'],tamperingdict['tm2'],tamperingdict['tt3'],tamperingdict['tm3']]
            stridetable[edgefrom + ';' + edgeto]['repudiation'] = ['Repudiation',repudiationdict['rt1'],repudiationdict['rm1'],repudiationdict['rt2'],repudiationdict['rm2'],repudiationdict['rt3'],repudiationdict['rm3']]
            stridetable[edgefrom + ';' + edgeto]['info'] = ['Information Disclosure',infodict['it1'],infodict['im1'],infodict['it2'],infodict['im2'],infodict['it3'],infodict['im3']]
            stridetable[edgefrom + ';' + edgeto]['dos'] = ['Denial of Service',dosdict['dt1'],dosdict['dm1'],dosdict['dt2'],dosdict['dm2'],dosdict['dt3'],dosdict['dm3']]
            stridetable[edgefrom + ';' + edgeto]['elevation'] = ['Elevation of privilege',elevationdict['et1'],elevationdict['em1'],elevationdict['et2'],elevationdict['em2'],elevationdict['et3'],elevationdict['em3']]
    if (isStride):
        graph.add_edge(pydot.Edge(edgefrom, edgeto, label=label + ' | ' +crossingboundary, color='red'))
    else:
        graph.add_edge(pydot.Edge(edgefrom, edgeto, label=label))
   

# Export STRIDE to csv table
with open(filename+'.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile, delimiter=';',quotechar='',escapechar='\\', quoting=csv.QUOTE_NONE)
    writer.writerow(['sep=','']) #Forces excel to bypass system delimiter and use the provided one instead
    for key, value in stridetable.iteritems():
        edgefrom, edgeto = key.split(';')
        writer.writerow(['',edgefrom + ' Threat',edgefrom + ' Mitigation','Flow Threat','Flow Mitigation',edgeto + ' Threat',edgeto + ' Mitigation'])
        writer.writerow(value['spoofing'])
        writer.writerow(value['tampering'])
        writer.writerow(value['repudiation'])
        writer.writerow(value['info'])
        writer.writerow(value['dos'])
        writer.writerow(value['elevation'])
        writer.writerow('') #add empty row for next table
        

# Generate clusters
for key,values in clusters.iteritems():
    cluster = pydot.Cluster(key,label= key,labelloc='b', style='dashed',color='grey', labelfontcolor ='grey')
    for item in values:
        cluster.add_node(pydot.Node(item,label=item))
    nclusters[key] = cluster
    

# Generate nested clusters
for key,values in nestedclusters.iteritems():
    for item in values[::-1]:
        clusterin = nclusters[item] #nested cluster
        out = values[values.index(item) - 1] #Name of encapsulating cluster
        if 'root' not in item:
            if out not in nclusters: #If the cluster does no exist (for encapsulating stuff
                clusterout = pydot.Cluster(out,label= out ,labelloc='b', style='dashed',color='grey', labelfontcolor ='grey')
            else:
                clusterout = nclusters[out] #encapsulating cluster
            clusterout.add_subgraph(clusterin) 
            nclusters[out] = clusterout
            
       
#Finally generate the graph
graph.write_png(filename+'.png') 
graph.write(filename+'.dot')

print 'Graph has been generated as '+filename+'.png'
print 'STRIDE has been exported to graphs/'+filename+'.csv'


