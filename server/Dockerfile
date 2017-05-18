FROM java:openjdk-8

COPY . /webpush-server

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y ca-certificates&& \
    echo "export LANG=C.UTF-8" > /etc/profile.d/locale.sh && \
    rm -rf /etc/localtime && \
    ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    \
    cd /webpush-server && ./gradlew clean && \
    cd /webpush-server && rm -rf ~/.gradle && ./gradlew clean build -x test && \
    mkdir -p /usr/local/webpush-server/lib && \
    cp -R /webpush-server/build/libs/* /usr/local/webpush-server/lib/ && \
    rm -rf /webpush-server

ENTRYPOINT java $JAVA_OPTS -jar /usr/local/webpush-server/lib/webpush-server.jar

EXPOSE 8080 8080
