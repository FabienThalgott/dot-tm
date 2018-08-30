# Dot-TM

A tool using a json input to generate a DOT graph and STRIDE CSV file



## Getting Started

To use this, just git clone the project to your machine. 
Take example.json as a template. Entities, processes, datastore and edges need to be created in their respective nodes as in the example.
Once ready, simply run dot-tm.py
Check the documentation for more details : [HowTo.pdf](HowTo.pdf)



### Prerequisites

The solution requires: 

	- Python 2.7
	
	- pydot 1.2.4
		pip install pydot
		
	- graphviz 2.38 
		https://www.graphviz.org/download/

### Docker Hub

You can get the latest build from docker hub : 
` docker pull fallenz/dot-tm `

Then run the instance with `docker run -d -p 8090:80 --name dotm fallenz/dot-tm:latest `

Once done, open your web browser of choice and open http://localhost:8090/


### Docker Build Your Own
Alternatively, You can build your own docker image using the supplied Dockerfile.

`#Run this command from the location where the Dockerfile is situated`

`docker build -t my_dot-tm . `

`# Expose port 8090 on localhost to access the web page`

`docker run -d -p 8090:80 --name dotm my_dot-tm `

Once done, open your web browser of choice and open http://localhost:8090/


## Authors

* **Fabien Thalgott** - *Initial work* 



