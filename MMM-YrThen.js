Module.register('MMM-YrThen', {
    defaults: {
        location: "1-2296935",
        yrApiUrl: "https://www.yr.no/api/v0/locations/id/%s/forecast",
        updateInterval: 10000
    },

    getTranslations: function() {
        return {
            no: "translations/no.json",
        }
    },

    getScripts: function() {
        return [
            'printf.js',
            'readTextFile.js'
        ];
    },

    getStyles: function() {
        return [
            'styles.css'
        ];
    },

    start: function() {
        Log.info('Starting module ' + this.name);
        this.list = null;
        this.loaded = false;
        var forecastUrl = printf(printf('%s', this.config.yrApiUrl),this.config.locationId);
        this.getForecast(forecastUrl);
        var self = this;
        var dummyText = 'Nothing loaded yet ...';

        setInterval(function() {
            self.updateDom(1000);
        }, 60000);
    },

    socketNotificationReceived: function(notification, payload) {
        if(notification === 'YR_FORECAST_DATA') {
            Log.info('Got forecast');
            this.processForecast(payload.forecast);
            this.updateDom(1000);

        }
    },

    getForecast: function(url) {
        Log.info('Getting forecast ...');
        this.sendSocketNotification('GET_YR_FORECAST', {
            forecastUrl: url,
            config: this.config
        });
    },

    getDom: function() {
        var wrapper = document.createElement('div');
        var animationWrapper = document.createElement('div');
        animationWrapper.className = 'animation';

        if (!this.loaded) {
            wrapper.innerHTML = this.translate('loading');
            wrapper.className = 'dimmed light small';
            return wrapper;
        }
        var forecast = document.createElement('div');
        forecast.className = 'forecast';

        wrapper.appendChild(forecast);
        wrapper.appendChild(this.makeForecast());
        return wrapper;
    },

    makeForecast: function() {
        return this.dummyText;
    }

    processForecast: function(obj) {
        Log.info('Processing forecast ...');
        this.dummyText = JSON.stringify(obj.longIntervals);
/*        if(obj.shortIntervals) {
            this.weatherSymbol = this.calculateWeatherSymbolId(obj.shortIntervals[0].symbol);
            this.temperature = obj.shortIntervals[0].temperature.value;
            this.loaded = true;
        } */
    }
});
