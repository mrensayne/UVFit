// This #include statement was automatically added by the Particle IDE.
#include "StateMachine.h"

// This #include statement was automatically added by the Particle IDE.
#include "Data.h"
#include <Wire.h>
#include <vector>

int startstopbtn = A0;
int internettestbtn = D5;
int x = 0;
int eventID = 0;
int UVThreshHold = 0;
int threshcounter{ 0 };
int DelayCounter{ 0 };
bool responseGotten = true;
bool initUvThresh = true;
bool Internet = true;
bool pollUploading = false;
int TwentyFourHours{ 0 };
int pingcounter{ 0 };
int pollcounter{ 0 };


Data SensorData;
StateMachine SM;
std::vector<Data> Activities;

void setup() {
	pinMode(startstopbtn, INPUT_PULLUP);
	pinMode(internettestbtn, INPUT_PULLUP);
	SensorData.init();
	SM.initStatusLed();
	Serial.begin(9600);
	Particle.subscribe("hook-response/DataRead", myHandler, MY_DEVICES);
	Particle.subscribe("hook-response/DevSettings", settingsHandler, MY_DEVICES);
}


void loop() {
	if (initUvThresh)
	{
		Particle.publish("DevSettings", "", PRIVATE);
		initUvThresh = false;
	}
	if (SM.Tick(getInput(), SensorData, Internet))
	{ // Publish Flag Was High
		Activities.push_back(SensorData);
		SensorData.clear();
		if (Particle.connected())
		{
			pollUploading = false;
			uploadData();
			TwentyFourHours = 0;
		}
		else
		{
			pollUploading = true;
			Serial.println("Particle Unable to upload");
		}
	}
	if (pollUploading && SM.getState() != State::SEND)
	{
		if (Particle.connected() && pollcounter > 100)
		{
			pollcounter = 0;
			pollUploading = false;
			uploadData();
		}
		else
		{
			pollcounter++;
			TwentyFourHours++;
		}
	}
	if (TwentyFourHours >= 864000)
	{//24 hours has passed
		Activities.clear();
	}
	if (threshcounter >= 200)
	{// Commented out for testing, uncomment when done
		Particle.publish("DevSettings", "", PRIVATE);
		threshcounter = 0;
	}
	threshcounter++;
	delay(100);
}

void uploadData()
{
	int x{ 0 };
	while (Activities.size() > 0)
	{
		if (responseGotten)
		{
			Serial.println("");
			Serial.print("UPLOADING ACTIVITY: ");
			Serial.print(x);
			Serial.println("");
			if (!postData(Activities[0]))
			{//Unable to post because of network problem
				Serial.println("Here is the problem");
				return;
			}
			else
			{//Post Successful
				Activities.erase(Activities.begin());
				x++;
			}
		}
	}
}


Input getInput()
{
	Input input;
	if (digitalRead(startstopbtn) == 0) { // pulldown resistor, 0: Pressed
		while (digitalRead(startstopbtn) == 0);
		return Input::POWER;
	}
	if (digitalRead(internettestbtn) == 0)
	{
		while (digitalRead(internettestbtn) == 0);
		Serial.println("Internet Btn");
		return Input::INTERNET;
	}
	return Input::IDLE;
}

bool postData(Data data)
{
	x = 0;
	while (x < data.size())
	{
		if (responseGotten)
		{
			DelayCounter = 0;
			responseGotten = false;
			Serial.println(data.toPublishString(x));
			Particle.publish("DataRead", data.toPublishString(x), PRIVATE);
		}
		else {
			if (DelayCounter > 20)
			{// No Wifi Signal Found or Server Down Time Out
				Serial.println("Postdata() Timed out");
				Activities.push_back(data);
				x = 0;
				DelayCounter = 0;
				return false;
			}
			else
			{// No Wifi Signal Found or Server Down
				DelayCounter++;
				Serial.println("Delayed");
			}
		}
		delay(200);
	}
	x = 0;
	DelayCounter = 0;
	return true;
}


void myHandler(const char *event, const char *data) {
	responseGotten = true;
	x += 5;
	// Formatting output
	String output = String::format("Response from Post:\n  %s\n", data);
	// Log to serial console
	Serial.println(output);

}

void settingsHandler(const char *event, const char *data) {
	Serial.print("Updated ActType: ");
	Serial.print(data[1]);
	Serial.println("");

	if (data[1] == '1')
	{
		SensorData.setActType("Running");
	}
	else if (data[1] == '2')
	{
		SensorData.setActType("Jogging");
	}
	else if (data[1] == '3')
	{
		SensorData.setActType("Walking");
	}


	Serial.print("Updated UV Threshold: ");

	int index{ 0 };
	
	for (int x = 0; x < strlen(data); x++)
	{
		if (data[x] == ',')
			index = x+1;
	}
	String uvData = "";
	for (int x = index; x < strlen(data) - 1; x++)
	{
		uvData += data[x];
	}
	Serial.print(atoi(uvData));
	Serial.println("");
	SM.setUVThreshHold(atoi(uvData));
}
