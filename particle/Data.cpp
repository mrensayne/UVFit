#include "Data.h"

Data::Data()
{

}

Data::Event::Event(float a, float b, float c, int d)
{
	longitude = a;
	latitude = b;
	speed = c;
	UV = d;
}

bool Data::checkUVThresh(int thresh)
{
	return events[events.size() - 1].UV > thresh;
}

String Data::toPublishString(int index)
{//"{\"latitude\":[12,11,22,1],\"longitude\":[12,11,22,1],\"UV\":[1,2,3,4],\"Speed\":[5,6,7,8]}"
	int endof = index + 5;
	if (abs(endof - events.size()) <= 4)
	{
		endof = events.size();
	}
	char temp[40];
	sprintf(temp, "%d", eventID);
	String data = "{ \"f\": \"";
	data += temp;
	data += "\", \"b\":[";
	for (int x = index; x < endof; x++)
	{// Longitudes
		char lon[40];
		if (events[x].longitude != 0)
		{
			sprintf(lon, "%.2f", events[x].longitude);
		}
		else
		{
			sprintf(lon, "%d", events[x].longitude);;
		}
		data += lon;
		if (x + 1 < endof)
		{
			data += ",";
		}
	}
	data += "],\"c\":[";
	for (int x = index; x < endof; x++)
	{// Latitudes
		char lat[40];
		if (events[x].latitude != 0)
		{
			sprintf(lat, "%.2f", events[x].latitude);
		}
		else
		{
			sprintf(lat, "%d", events[x].latitude);
		}
		data += lat;
		if (x + 1 < endof)
		{
			data += ",";
		}
	}
	data += "],\"d\":[";
	for (int x = index; x < endof; x++)
	{// Latitudes
		char UV[40];
		sprintf(UV, "%d", events[x].UV);
		data += UV;
		if (x + 1 < endof)
		{
			data += ",";
		}
	}
	data += "],\"e\":[";
	for (int x = index; x < endof; x++)
	{// Latitudes
		char spd[40];
		if (events[x].speed != 0)
			sprintf(spd, "%.2f", events[x].speed);
		else
			sprintf(spd, "%d", events[x].speed);
		data += spd;
		if (x + 1 < endof)
		{
			data += ",";
		}
	}
	data += "], \"x\": \"";
	data += eventTime;
	data += "\", \"y\":\"";
	char size[40];
	sprintf(size, "%d", events.size());
	data += size;
	data += "\", \"z\": \"";
	data += actType;
	data += "\"}";
	return data;
}

int CustAbs(int x)
{
	if (x < 0)
	{
		x *= -1;
	}
	return x;
}

void Data::getSensorData()
{
	events.push_back(Event(locationTracker.readLon(), locationTracker.readLat(), locationTracker.getSpeed(), uv.readUV()));
}

void Data::init()
{
	uv = Adafruit_VEML6070();
	locationTracker = AssetTracker();
	locationTracker.begin();
	locationTracker.gpsOn();
	uv.begin(VEML6070_1_T);
	eventID = CustAbs(HAL_RNG_GetRandomNumber());
	eventTime = Time.format(TIME_FORMAT_ISO8601_FULL);
	EEPROM.get(0, eventID);
}

void Data::clear()
{
	//Old Event ID Code
	//eventID = CustAbs(HAL_RNG_GetRandomNumber());
	eventID++;
	EEPROM.put(0, eventID);
	events.clear();
}

int Data::size()
{
	return events.size();
}

int Data::checkSpeed()
{
	return locationTracker.getSpeed();
}

void Data::setActType(String type)
{
	this->actType = type;
	Serial.println(this->actType);
}