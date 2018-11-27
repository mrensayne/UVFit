#ifndef DATA_H
#define DATA_H
#include<stdio.h>
#include<vector>
#include<Wire.h>
#include <AssetTracker.h>
#include <Adafruit_VEML6070.h>
#include <math.h>
#include <stdlib.h>

//These are particle changes
class Data
{
private:
	struct Event
	{
		float longitude{ 0 };
		float latitude{ 0 };
		float speed{ 0 };
		int UV{ 0 };
		Event(float, float, float, int);
	};
	Adafruit_VEML6070 uv;
	AssetTracker locationTracker;
	std::vector<Event> events;
	int eventID{ 0 };
	String eventTime{ "" };
	//Determines the type of activity(Running, Jogging, Walking)
	String actType{ "Auto" };
public:
	Data();
	void getSensorData();
	//Returns true if the threshhold is over
	bool checkUVThresh(int thresh);
	//returns latest speed used for autopause
	int checkSpeed();
	int getLatestSpeed() { return events[events.size() - 1].speed; }
	void init();
	int size();
	void clear();
	void fillDebugData() { events.push_back(Event(1, 2, 3, 4)); }
	String toPublishString(int);
	void setActType(String type);
};

#endif