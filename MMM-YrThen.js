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
        this.list = null;
        this.loaded = false;
        var forecastUrl = printf(printf('%s', this.config.yrApiUrl),this.config.locationId);
        this.getForecast(forecastUrl);
        var self = this;

        setInterval(function() {
            self.updateDom(1000);
        }, 60000);
    },

    socketNotificationReceived: function(notification, payload) {
        if(notification === 'YR_FORECAST_DATA') {
            this.processForecast(payload.forecast);
            this.updateDom(1000);
        }
    },

    getForecast: function(url) {
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

        forecast.appendChild(this.getWeatherSymbol());
        wrapper.appendChild(forecast);
        wrapper.appendChild(this.getTemperature());
        wrapper.appendChild(this.createNowcastText(nowCast));
        return wrapper;
    },

    getWeatherSymbol: function() {
        var symbol = document.createElement('img');
        symbol.className = 'weatherSymbol';
        symbol.src = this.file(printf('images/%s.svg', this.weatherSymbol));
        return symbol;
    },

    getTemperature: function() {
        var temp = document.createElement('div');
        temp.className = 'temperature light large bright';
        temp.innerHTML = printf('%s°', Math.round(this.temperature));
        return temp;
    },

    calculateWeatherSymbolId: function(data) {
        if (!data) return '';
        let id = data.n < 10 ? printf('0%s', data.n) : data.n;
        switch (data.var) {
            case 'Sun':
            id += 'd';
            break;
            case 'PolarNight':
            id += 'm';
            break;
            case 'Moon':
            id += 'n';
            break;
        }
        return id;
    },

    processForecast: function(obj) {
        if(obj.shortIntervals) {
            this.weatherSymbol = this.calculateWeatherSymbolId(obj.shortIntervals[0].symbol);
            this.temperature = obj.shortIntervals[0].temperature.value;
            this.loaded = true;
        }
    }
});
