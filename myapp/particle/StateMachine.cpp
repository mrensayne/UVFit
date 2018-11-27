#include "StateMachine.h"

StateMachine::StateMachine()
{

}

bool StateMachine::Tick(Input input, Data& data, bool &test)
{
	if (input == Input::INTERNET)
	{
		if (test)
			test = false;
		else
			test = true;
		return false;
	}
	if (input == Input::POWER && state != State::OFF)
	{// Power button was pressed so send to server and power off
		state = State::SEND;
	}
	switch (state)
	{
	case State::OFF:
	{// Device is stopped and does nothing
		setLedStatus();
		if (input == Input::POWER)
		{// Power button pressed
			state = State::INIT;
			Tick(Input::IDLE, data, test);
		}
		else
		{// Power button NOT pressed

		}
		break;
	}
	case State::SEND:
	{
		setLedStatus();
		//Serial.println(data.toPublishString());
		state = State::OFF;
		Tick(Input::IDLE, data, test);
		return true;
	}
	case State::IDLE:
	{// Device Idle
		setLedStatus();
		if (RecordClock >= 5)
		{// we set it to record every half a second because the LED display takes up half a second to do it's signal
			state = State::SENSE;
		}
		else
		{
			RecordClock++;
		}
		break;
	}
	case State::PAUSE:
	{// When speed is 0 for over 2 seconds
		if (data.checkSpeed() <= -1)
		{ // set from -1 to 0 for actual functionality
			Serial.println("In Pause");
		}
		else
		{
			state = State::SENSE;
		}
		break;
	}
	case State::INIT:
	{// Where we can init device on Bootup
		state = State::IDLE;
		Tick(Input::IDLE, data, test);
		break;
	}
	case State::SENSE:
	{
		if (autoPauseCounter >= 2)
		{
			state = State::PAUSE;
			autoPauseCounter = 0;
			break;
		}
		setLedStatus();
		data.getSensorData();
		if (data.getLatestSpeed() <= 0)
		{
			autoPauseCounter++;
		}
		Serial.print(data.size());
		Serial.print(" ");
		if (data.checkUVThresh(UVThreshHold))
		{//Reading above threshhold levels
			digitalWrite(UVWarningLED, HIGH);
		}
		else
		{
			digitalWrite(UVWarningLED, LOW);
		}
		state = State::IDLE;
		break;
	}
	}
	//SIToString(input);
	return false;
}


void StateMachine::SIToString(Input input)
{
	if (PrintClock < 10 && state != State::SENSE)
	{// Print every second or if we are in a sense 
		PrintClock++;
		return;
	}
	Serial.println("--------------------------");
	//State
	switch (state)
	{
	case State::IDLE:
	{
		Serial.println("State=>IDLE");
		break;
	}
	case State::INIT:
	{
		Serial.println("State=>INIT");
		break;
	}
	case State::OFF:
	{
		Serial.println("State=>OFF");
		break;
	}
	case State::SENSE:
	{
		Serial.println("State=>SENSE");
		break;
	}
	default:
		Serial.println("State=>STATE NOT IMPLEMENTED");
	}
	//Input
	switch (input)
	{
	case Input::IDLE:
	{
		Serial.println("Input=>IDLE");
		break;
	}
	case Input::POWER:
	{
		Serial.println("Input=>POWER");
		break;
	}
	default:
		Serial.println("Input=>INPUT NOT IMPLEMENTED");
	}
	Serial.println("--------------------------");
	PrintClock = 0;
}

void StateMachine::initStatusLed()
{
	statusLed = D7;
	UVWarningLED = A1;
	pinMode(UVWarningLED, OUTPUT);
	pinMode(statusLed, OUTPUT);
}

void StateMachine::setLedStatus()
{// Sets status based on state [MUST BE PUT AFTER STATE IS CHANGED]
	switch (state)
	{
	case State::OFF:
	{// LED is OFF
		LedClock = 0;
		digitalWrite(statusLed, LOW);
		break;
	}
	case State::IDLE:
	{// LED flashes every second when IDLE
		digitalWrite(statusLed, HIGH);
		LedClock = 0;
		break;
	}
	case State::SENSE:
	{//Blinks 5 times in half a second
		digitalWrite(statusLed, LOW);
		delay(50);
		digitalWrite(statusLed, HIGH);
		delay(50);
		digitalWrite(statusLed, LOW);
		delay(50);
		digitalWrite(statusLed, HIGH);
		delay(50);
		digitalWrite(statusLed, LOW);
		delay(50);
		digitalWrite(statusLed, HIGH);
		delay(50);
		digitalWrite(statusLed, LOW);
		delay(50);
		digitalWrite(statusLed, HIGH);
		delay(50);
		digitalWrite(statusLed, LOW);
		delay(50);
		digitalWrite(statusLed, HIGH);
		delay(50);
		break;
	}
	case State::SEND:
	{
		digitalWrite(statusLed, LOW);
		delay(500);
		digitalWrite(statusLed, HIGH);
		delay(1500);
		break;
	}
	default:
	{
		Serial.println("In Default For LED Status");
	}
	}
}

void StateMachine::setUVThreshHold(int thresh)
{
	if (thresh <= 0)
		return;
	this->UVThreshHold = thresh;
}