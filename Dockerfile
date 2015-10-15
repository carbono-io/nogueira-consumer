FROM carbonoio/ansible-node

RUN yum install openssh-clients -y && \
    mkdir -p /home/consumer && \
    groupadd -r consumer && \
    useradd -r -d /home/consumer -g consumer consumer && \
    mkdir -p /home/consumer/.ssh && \
    mkdir -p /home/consumer/nogueira-consumer && \
    chown -R consumer:consumer /home/consumer && \
    echo "consumer ALL=(ALL) NOPASSWD: /usr/bin/chown" >> /etc/sudoers

USER consumer

WORKDIR /home/consumer/nogueira-consumer

COPY . /home/consumer/nogueira-consumer

#ENTRYPOINT ["node", "."]