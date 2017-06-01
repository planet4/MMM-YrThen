# MagicMirror² Module: YrThen

This will be an unofficial Yr Weather Forecast module for [MagicMirror²](https://github.com/MichMich/MagicMirror), which displays data from [Yr](https://www.yr.no/nb/).

It is based on [MMM-YrNow](https://github.com/YR/MMM-YrNow), from Yr itself. Yr is a weather service from the Norwegian Broadcasting Corporation and the Norwegian Meteorological Institute.

This is a work in progress, and might never be ready for release.

## How to install

Remote into your Magic Mirror box using a terminal software and go to the modules folder:

    cd ~/MagicMirror/modules

Clone the repository:

	git clone https://github.com/fmandal/MMM-YrThen

Add the module to the modules array in the config/config.js file by adding the following section. You can change this configuration later when you see this works:

	{
		module: 'MMM-YrThen',
		position: 'top_right',
		config: {
			locationId: '1-2296935',
            showWeatherForecast: true
		}
	},

## Configuration options

<table style="width:100%">
	<tr>
		<th>Option</th>
		<th>Comment</th>
		<th>Default</th>
	</tr>
	<tr>
		<td>locationId</td>
		<td>The unique Id found in the Url of any location on <a href="https://www.yr.no/nb/liste/dag/1-2296935/Norge/Nord-Trøndelag/Steinkjer/Steinkjer">Yr</a> I.e. Steinkjer.</td>
		<td>1-2296935</td>
	</tr>
    <tr>
        <td>showWeatherForecast</td>
        <td>If there's no precipitation in the nowcast, the weather forecast for the next period is shown.</td>
        <td>true</td>
    </tr>
</table>
