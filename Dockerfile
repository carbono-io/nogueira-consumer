FROM carbonoio/ansible-node

RUN yum install openssh-clients -y && \
    mkdir -p /home/consumer && \
    groupadd -r consumer && \
    useradd -r -d /home/consumer -g consumer consumer && \
    mkdir -p /home/consumer/.ssh && \
    mkdir -p /home/consumer/nogueira-consumer

COPY ./staging-proxy.pem /home/consumer/.ssh/staging-proxy.pem
COPY . /home/consumer/nogueira-consumer

RUN chown -R consumer:consumer /home/consumer

USER consumer

WORKDIR /home/consumer/nogueira-consumer

ENV AWS_DEFAULT_REGION us-east-1

ENTRYPOINT ["node", "."]