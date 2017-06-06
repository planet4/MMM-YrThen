var NodeHelper = require('node_helper');
var request = require('request');

console.log("MMM-YrThen: Starting MMM-YrThen in node_helper");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-YrThen: Starting helper for MMM-YrThen");
        this.config = null;
        this.forecastUrl = '';
    },

    socketNotificationReceived: function(notification, payload) {
        var self = this;
        console.log("MMM-YrThen: Received notification");
        if(notification === 'GET_YRTHEN_FORECAST') {
            console.log("MMM-YrThen: Received GET_YRTHEN_FORECAST notification");
            self.config = payload.config;
            self.forecastUrl = payload.forecastUrl;
            this.getForecastFromYrThen();
        }
    },

    getForecastFromYrThen: function() {
        console.log("MMM-YrThen: Getting forecast");
        var self = this;
        var locationData = {};

        request({url: self.forecastUrl, method: 'GET'}, function(error, response, message) {
            console.log("MMM-YrThen: Requesting forecast from" + self.forecastUrl);
            if (!error && (response.statusCode == 200 || response.statusCode == 304)) {
                locationData.forecast = JSON.parse(message);
                console.log("MMM-YrThen: Returning forecast");
                console.log("MMM-YrThen: Forecast data:" + locationData);
                self.sendSocketNotification('YRTHEN_FORECAST_DATA', locationData);
            }
            else{
                console.log("MMM-YrThen: Error!");
            }
        });
    }

});
