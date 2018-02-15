FROM ubuntu:16.04

MAINTAINER Fabien Thalgott <fabien.thalgott@gmail.com>

RUN apt-get update && apt-get install -y \
    apache2 \
    curl \
    git \
	libapache2-mod-php7.0 \
    php7.0 \
    python \
    python-pip \
	graphviz \
	python-pydot \
	python-pydot-ng

WORKDIR /root/
RUN git clone https://github.com/project-cx/dot-tm.git
RUN mv dot-tm/* /var/www/html/

WORKDIR /var/www/html/
RUN chmod 777 /var/www/html/
RUN echo '<meta http-equiv="refresh" content="0; url=./dot-tm.html" />' > index.html
ENTRYPOINT ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]

EXPOSE 80/tcp
