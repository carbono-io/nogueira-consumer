FROM carbonoio/ansible-node

RUN mkdir -p /home/consumer && \
    groupadd -r consumer && \
    useradd -r -d /home/consumer -g consumer consumer && \
    mkdir -p /home/consumer/nogueira-consumer

USER consumer

WORKDIR /home/consumer/nogueira-consumer

COPY . /home/consumer/nogueira-consumer

ENTRYPOINT ["node", "."]