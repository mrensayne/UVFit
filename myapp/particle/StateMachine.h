#ifndef STATEMACHINE_H
#define STATEMACHINE_H
#include "Data.h"

enum class State { IDLE, INIT, OFF, SENSE, SEND, PAUSE };
enum class Input { POWER, IDLE, TRUEPOWER };

//Were gonna change things and find a problem
class StateMachine
{
private:
	State state{ State::OFF };
	void SIToString(Input);
	int statusLed{ 0 };
	int UVWarningLED{ 0 };
	int UVWarningTimer{ 0 };
	int autoPauseCounter{ 0 };
	void setLedStatus();
	int LedClock{ 0 };
	int PrintClock{ 0 };
	int RecordClock{ 0 };
	int PublishClock{ 0 };
public:
	int UVThreshHold{ 65536 };
	StateMachine();
	State getState() { return state; }
	void initStatusLed();
	void setUVThreshHold(int thresh);
	bool Tick(Input input, Data& data); // bool is the publish flag
};

#endif // !STATEMACHINE_H
