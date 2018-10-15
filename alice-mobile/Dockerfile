# Based on https://github.com/marcoturi/ionic-docker

FROM debian:jessie

ENV DEBIAN_FRONTEND=noninteractive \
    ANDROID_HOME=/opt/android-sdk-linux \
    GRADLE_VERSION=4.4.1

# Install Android SDK and it's dependencies
RUN apt-get update &&  \
    # Basics
    apt-get install -y git wget curl unzip build-essential && \
    # Font libraries
    apt-get -qqy install fonts-ipafont-gothic xfonts-100dpi xfonts-75dpi xfonts-cyrillic xfonts-scalable libfreetype6 libfontconfig && \
    # install python-software-properties (so you can do add-apt-repository)
    apt-get update && apt-get install -y -q python-software-properties software-properties-common  && \
    add-apt-repository "deb http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" -y && \
    echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections && \
    apt-get update && apt-get -y install oracle-java8-installer && \
    # System libs for android enviroment
    echo ANDROID_HOME="${ANDROID_HOME}" >> /etc/environment && \
    dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -y --force-yes expect ant wget libc6-i386 lib32stdc++6 lib32gcc1 lib32ncurses5 lib32z1 qemu-kvm kmod && \
    apt-get clean && \
    apt-get autoclean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    # Install Android Tools
    mkdir  /opt/android-sdk-linux && cd /opt/android-sdk-linux && \
    wget --output-document=android-tools-sdk.zip --quiet https://dl.google.com/android/repository/tools_r25.2.3-linux.zip && \
    unzip -q android-tools-sdk.zip && \
    rm -f android-tools-sdk.zip && \
    # Install Gradle
    mkdir  /opt/gradle && cd /opt/gradle && \
    wget --output-document=gradle.zip --quiet https://services.gradle.org/distributions/gradle-"$GRADLE_VERSION"-bin.zip && \
    unzip -q gradle.zip && \
    rm -f gradle.zip && \
    chown -R root. /opt

# Setup environment
ENV PATH ${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools:/opt/gradle/gradle-${GRADLE_VERSION}/bin
RUN yes Y | ${ANDROID_HOME}/tools/bin/sdkmanager "build-tools;25.0.2" "platforms;android-25" "platform-tools"

# Install NodeJS
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get update &&  \
    apt-get install -y nodejs

ENV NPM_VERSION=6.0.1 \
    IONIC_VERSION=4.1.1 \
    CORDOVA_VERSION=8.0.0

RUN npm install -g npm@"$NPM_VERSION" cordova@"$CORDOVA_VERSION" ionic@"$IONIC_VERSION"

WORKDIR /sources

COPY package*.json ./

RUN ["npm", "install"]

COPY . .

# COPY .git .git

# RUN ls .git

# RUN bash scripts/update-app-version.sh

RUN ionic cordova platform add android --noresources --no-interactive --verbose
RUN ionic cordova build android --device --no-interactive --verbose --prod

RUN ionic cordova build browser

RUN curl \
  -F "ipa=@platforms/android/app/build/outputs/apk/debug/app-debug.apk" \
  -F "notes=$changes" \
  -F "notes_type=0" \
  -F "status=2" \
  -F "release_type=2" \
  -H "X-HockeyAppToken: 01398666c9714a43bb032743eafb9a4e" \
  https://rink.hockeyapp.net/api/2/apps/upload

CMD ["ionic", "serve"]