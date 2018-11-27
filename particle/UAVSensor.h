// This #include statement was automatically added by the Particle IDE.
#include "StateMachine.h"

// This #include statement was automatically added by the Particle IDE.
#include "Data.h"
#include <Wire.h>
#include <vector>

int startstopbtn = A0;
int PowerOnBtn = D5;
int PowerLED = D6;
int x = 0;
int eventID = 0;
int UVThreshHold = 0;
int threshcounter{ 0 };
int DelayCounter{ 0 };
bool responseGotten = true;
bool initUvThresh = true;
bool PowerOn = true;
bool pollUploading = false;
int TwentyFourHours{ 0 };
int pingcounter{ 0 };
int pollcounter{ 0 };

Input input;
Data SensorData;
StateMachine SM;
std::vector<Data> Activities;

void setup() {
	pinMode(startstopbtn, INPUT_PULLUP);
	pinMode(PowerOnBtn, INPUT_PULLUP);
	pinMode(PowerLED, OUTPUT);
	SensorData.init();
	SM.initStatusLed();
	Serial.begin(9600);
	Particle.subscribe("hook-response/DataRead", myHandler, MY_DEVICES);
	Particle.subscribe("hook-response/DevSettings", settingsHandler, MY_DEVICES);
}


void loop() {
	input = getInput();
	if (input != Input::TRUEPOWER)
	{
		initUvThresh = true;
		digitalWrite(PowerLED, LOW);
	}
	else
	{//Power button is truly pressed
		digitalWrite(PowerLED, HIGH);
		while (true)
		{//Lets loop inside the powered on state
			//Serial.print("."); // Doing this to see if it crashes or wtf is going on
			input = getInput();
			if (input == Input::TRUEPOWER)
			{//Power button pressed when device on so power off
				Serial.println("Powering Off");
				break;
			}
			if (initUvThresh)
			{
				Serial.println("Grabbing Init Threshholds");
				Particle.publish("DevSettings", "", PRIVATE);
				initUvThresh = false;
			}
			if (SM.Tick(input, SensorData))
			{ // Publish Flag Was High
				Serial.println("Send Flag Was High From STate maching");
			  //Setting this here because if we failed a send, we need to be able to try again the next time user manually sends data
				responseGotten = true;
				Activities.push_back(SensorData);
				SensorData.clear();
				/*if (Particle.connected())*/
				if (Particle.connected())
				{
					Serial.println("Particle Connected");
					pollUploading = false;
					if (uploadData())
					{// If return is true then we successfully posted
						TwentyFourHours = 0;
					}
					else
					{
						pollUploading = true;
					}
				}
				else
				{
					Serial.println("Particle Not Connected");
					pollUploading = true;
					Serial.println("Particle Unable to upload");
				}
			}
			if (pollUploading && SM.getState() != State::SEND)
			{
				Serial.println("Polling Uploads is HIGH");
				if (Activities.size() == 0)
				{//Making sure that we aren't polling when nothing is left to upload still due to late arrival of server response
					Serial.println("Stopping polling because activities is empty");
					pollUploading = false;
				}
				if (Particle.connected() && pollcounter > 1000)
				{
					Serial.println("Particle Connected and PollCounter is trying to upload");
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
				Serial.println("Clearing All Data due to 24 hours");
				Activities.clear();
			}
			if (threshcounter >= 200)
			{// Commented out for testing, uncomment when done
				Serial.println("Grabbing Thresh because of threshcounter");
				Particle.publish("DevSettings", "", PRIVATE);
				threshcounter = 0;
			}
			threshcounter++;
			delay(100);
		}
	}
	delay(200);
}

bool uploadData()
{
	Serial.println("");
	Serial.print("Activities.size() = ");
	Serial.print(Activities.size());
	Serial.println("");
	responseGotten = true;
	int x{ 0 };
	while (Activities.size() > 0)
	{
		Serial.print("|");
		if (responseGotten)
		{
			Serial.println("");
			Serial.print("UPLOADING ACTIVITY: ");
			Serial.print(x);
			Serial.println("");
			if (!postData(Activities[0]))
			{//Unable to post because of network problem
				Serial.println("Here is the problem");
				pollUploading = true;
				return false;
			}
			else
			{//Post Successful
				//Activities.erase(Activities.begin()); 
				x++;
			}
		}
		delay(100);
	}
	return true;
}


Input getInput()
{
	Input input;
	if (digitalRead(startstopbtn) == 0) { // pulldown resistor, 0: Pressed
		while (digitalRead(startstopbtn) == 0);
		return Input::POWER;
	}
	if (digitalRead(PowerOnBtn) == 0)
	{
		while (digitalRead(PowerOnBtn) == 0);
		Serial.println("PowerOn Btn");
		return Input::TRUEPOWER;
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
				//Activities.push_back(data);
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
	//Activities.erase(Activities.begin());
	return true;
}


void myHandler(const char *event, const char *data) {
	responseGotten = true;
	Activities.erase(Activities.begin());
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

	if (data[0] == '0')
	{
		SensorData.setActType("Auto");
	}
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
			index = x + 1;
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

void ResetWiFiConnection()
{
	WiFi.off();
	delay(10);
	WiFi.on();
	WiFi.connect();
	Particle.connect();
}