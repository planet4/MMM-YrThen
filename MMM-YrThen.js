Module.register('MMM-YrThen', {
    defaults: {
        location: "1-2296935",
        yrApiUrl: "https://www.yr.no/api/v0/locations/id/%s/forecast",
        yrCelestialApiUrl: "https://www.yr.no//api/v0/locations/%s/celestialevent",
        updateInterval: 3600000,
        initialLoadDelay: 1000,
        showAll: true,
        showPrecipitation: true,
        showMaxMin: false,
        details: true,
        numDetails: 2,
        title: 'Værmelding for Steinkjer',
        header: false
    },

    getTranslations: function() {
        return {
            no: "translations/no.json",
        }
    },

    getScripts: function() {
        return [
            'printf.js',
            'readTextFile.js',
            'moment.js'
        ];
    },

    getStyles: function() {
        return [
            'styles.css'
        ];
    },

    start: function() {
        Log.info('Starting module ' + this.name);
        moment.locale(config.language);
        this.dataFromYr;
        this.loaded = false;
        this.forecastData = {};
        this.scheduleUpdate(this.config.initialLoadDelay);
        var self = this;
        setInterval(function() {
            self.updateDom();
        }, 1000);
    },

    getDom: function() {
        var wrapper = document.createElement('div');
        if(!this.loaded){
            wrapper.innerHTML = this.translate('LOADING');
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if(this.config.header){
            var header = document.createElement('header');
            header.innerHTML = this.config.title;
            header.className = 'align-left';
            wrapper.appendChild(header);
        }
        wrapper.classList.add = "dimmed light small";

        var table = document.createElement('table');
        table.className = "xsmall yrthen yrThenForecast";
        var day;

        if(this.config.showAll == true){
            var timeRow = document.createElement('tr');
            table.appendChild(timeRow);
            for(var i = 0; i < 5; i++){
                var newCell = document.createElement('td');
                newCell.className = 'yrthen-time-cell align-center bright small';
                if(i == 0) newCell.innerHTML = '&nbsp;';
                if(i == 1) newCell.innerHTML = '00';
                if(i == 2) newCell.innerHTML = '06';
                if(i == 3) newCell.innerHTML = '12';
                if(i == 4) newCell.innerHTML = '18';
                timeRow.appendChild(newCell);
            }


            for (var f in this.dataFromYr) {
                var newData = this.dataFromYr[f];
                var checkTime = moment(newData.start).format("HH");
                var today = moment(newData.start).format("ddd");
                // Make max four cells pr day
                if(day != today){
                    var row = document.createElement('tr');
                    table.appendChild(row);

                    var dayCell = document.createElement("td");
                    dayCell.className = "yrthen-day align-left";
                    dayCell.innerHTML = moment(newData.start).format("dddd");
                    row.appendChild(dayCell);
                    day = today;
                }

                var forecastCell = document.createElement("td");
                forecastCell.className = "yrthen-forecast-cell";
//                forecastCell.innerHTML = '<span class="dimmed">' + moment(newData.start).format("HH") + '</span><br>';
                var icon = document.createElement("img");
                icon.className = "yrthen-icon ";
                icon.width = "40";
                var weatherSymbol = this.calculateWeatherSymbolId(newData.symbol);
                icon.src = this.file(printf('images/%s.svg', weatherSymbol));
                forecastCell.appendChild(icon);
                if(!this.config.showMaxMin){
                    forecastCell.innerHTML += '<br>';
                }
                forecastCell.innerHTML += ' <span class="bright yrthen-temp small">' + newData.temperature.value + '</span>';
                if(this.config.showMaxMin){
                    forecastCell.innerHTML += '<br>';
                }

                if(newData.temperature.min && newData.temperature.max && this.config.showMaxMin){
                    forecastCell.innerHTML += '<span class="dimmed yrthen-temp">(' + newData.temperature.max + '/' + newData.temperature.min + ')</span><br>';
                }
                if(this.config.showPrecipitation){
                    var precValue = ' <span class="yrthen-rain dimmed">(' + newData.precipitation.value;
                    if(this.config.showMaxMin){
                        precValue += ' mm';
                    }
                    precValue += ')</span>';
                    forecastCell.innerHTML += precValue;
                }
                row.appendChild(forecastCell);
            }
        }

        else{
            for (var f in this.dataFromYr) {
                var newData = this.dataFromYr[f];
                var checkTime = moment(newData.start).format("HH");

                var show = false;
                if(f < this.config.numDetails && this.config.details == true) show = true;
                if(checkTime > 11 && checkTime < 15) show = true;
                if(show == true){
                    var row = document.createElement('tr');
                    table.appendChild(row);

                    var dayCell = document.createElement("td");
                    dayCell.className = "yrthen-day align-left";
                    if(f < this.config.numDetails && this.config.details == true) dayCell.innerHTML = moment(newData.start).format("ddd HH:mm");
                    else dayCell.innerHTML = moment(newData.start).format("dddd");
                    row.appendChild(dayCell);

                    var iconCell = document.createElement("td");
                    iconCell.className = "yrthen-icon-cell";
                    row.appendChild(iconCell);

                    var icon = document.createElement("img");
                    icon.className = "yrthen-icon ";
                    icon.width = "40";
                    var weatherSymbol = this.calculateWeatherSymbolId(newData.symbol);
                    icon.src = this.file(printf('images/%s.svg', weatherSymbol));
                    iconCell.appendChild(icon);
        
                    var maxTempCell = document.createElement("td");
                    maxTempCell.innerHTML = newData.temperature.value;
                    maxTempCell.className = "align-right bright yrthen-temp small";
                    row.appendChild(maxTempCell);

                    var minTempCell = document.createElement("td");
                    minTempCell.innerHTML = newData.precipitation.value;
                    minTempCell.className = "align-right yrthen-rain dimmed";
                    row.appendChild(minTempCell);
                }
            }
        }


        wrapper.appendChild(table);
        return wrapper;
    },

    updateForecast: function() {
        Log.info('Updating forecast now');
        var forecastUrl = printf(printf('%s', this.config.yrApiUrl),this.config.location);
        this.sendSocketNotification('GET_YRTHEN_FORECAST', {
            forecastUrl: forecastUrl,
            config: this.config.updateInterval
        });
        this.scheduleUpdate();
    },

    processForecast: function(obj) {
        if(obj.longIntervals){
            this.loaded = true;
            this.dataFromYr = obj.longIntervals;
        }
        else{
            Log.info('I have no data!');
        }
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

    socketNotificationReceived: function(notification, payload) {
        if(notification === 'YRTHEN_FORECAST_DATA') {
            Log.info('Got forecast');
            this.processForecast(payload.forecast);
            this.updateDom(1000);
        }
    },

    scheduleUpdate: function(delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        setTimeout(function() {
            self.updateForecast();
        }, nextLoad);
    },

});
