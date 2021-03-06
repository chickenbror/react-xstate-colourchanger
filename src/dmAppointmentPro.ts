import { MachineConfig, actions, Action, assign, send } from "xstate";

// SRGS parser and example (logs the results to console on page load)
import { loadGrammar } from './runparser'
import { parse } from './chartparser'
import { grammar } from './grammars/meetingGrammar'

const gram = loadGrammar(grammar)

// Parse recognised speech to an object with 3 properties
function parseMeeting(input:string) {

    let prs = parse(input.toLowerCase().split(/\s+/), gram)
    let result = prs.resultsForRule(gram.$root)[0]

    let meeting ; //undefined if input cannot be parsed
    if (result!=undefined) {
        meeting = result.meeting;
        // remove the prepositions 'at','on' 
        if(!!meeting.time && meeting.time.slice(0,3)==='at '){
            meeting.time=meeting.time.slice(3) };
        if(!!meeting.day && meeting.day.slice(0,3)==='on '){
            meeting.day=meeting.day.slice(3) };
        }
    return meeting 
    }


function whatsMissing(context:SDSContext){
    let missing=[]
    if(!context.person){missing.push("with whom")}
    if(!context.weekday){missing.push("on which day")}
    if(!context.time){missing.push("at what time")}
    
    let prompt;
    if (missing.length===0) {prompt=`I have all the details of your meeting!`};
    if (missing.length===1) {prompt=`Tell me ${missing[0]} you are meeting`};
    if (missing.length===2) {prompt=`Tell me ${missing[0]}, and ${missing[1]} is your meeting`};
    if (missing.length===3) {prompt=`Tell me ${missing[0]}, ${missing[1]}, and ${missing[2]} is the meeting`};
    return prompt
}


// const sayWhatsMissing: Action<SDSContext, SDSEvent> = send((context: SDSContext) => ({
//     type: "SPEAK", value: whatsMissing(context)
// }))


function knownSoFar(context:SDSContext){
    let withPerson=(!!context.person)? 'with '+context.person : ''
    let onDay=(!!context.weekday)? 'on '+context.weekday : ''
    let atTime;
    if(!!context.time){
        atTime=(context.time === 'whole day')? 'for the whole day' : 'at '+context.time 
        }
    else{atTime=''}

    return `${withPerson} ${onDay} ${atTime}`
}


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function sharedRecognitions() {
    return [
        { target: 'stop', cond: (context:SDSContext) => context.recResult === 'stop' },
        { target: 'restart', cond: (context:SDSContext) => context.recResult === 'restart' },
        { target: ".nomatch" }
        ]
}

function promptAndAsk(promptEvent: Action<SDSContext, SDSEvent>): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
        initial: 'prompt',
        states: {
            prompt: {
                entry: promptEvent,
                on: { ENDSPEECH: 'ask' }
            },
            ask: {
                entry: send('LISTEN'),
            },
            nomatch: { entry: [say("Sorry, I didnt get that")],  
                       on: { ENDSPEECH: "prompt" } 
            },
        }
    })
}

function sayYes(answer: string){
    let yes=["yes", "of course", "sure", "absolutely", "yeah", "yep", "okay",]
    if(yes.includes(answer)){ return true }
}

function sayNo(answer: string){
    let yes=["no", "nope", "no thanks", "nah",]
    if(yes.includes(answer)){ return true }
}

/*
ISSUES AND DESIGN CHOICES

I did not use orthogonal states, instead each property is treated as a slot to be filled (to context.slot_name).
As long as a slot is unfilled (===undefined), the system will keep prompting for more information and update 
the context slots accordingly (but only with new information, ie, the already-filled slots won't be overwritten).

An issue I encountered was that the ASR automatically capitalises the first letter of a sentence and adding full stop at the end,
which will cause the grammar parser to fail to recognise it. So I lowercase the input string, but that means that the <item> person_name </item>
and words like 'I' in the SRXML must be written in lowercase too.


*/



export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    id: 'Pro',
    initial: 'welcome',
    states: {
        init: {
            on: {
                CLICK: 'start'
            }
        },
        stop: {
            entry: say("Ok, stopped"),
            always: 'init'
        },
        start: {
            entry: say("Lets make an appointment. "),
            // always: 'welcome'
            on: { ENDSPEECH: "welcome" }
        },
        restart: {
            entry: say("Ok, starting over"),
            // always: 'welcome'
            on: { ENDSPEECH: "welcome" } 
        },

        //01
        welcome: {
            on: {
                RECOGNISED: [
                    
                    //Update context as long as parsed grammar object is not undefined
                    {
                    cond: (context) => !!parseMeeting(context.recResult),
                    actions: assign((context) => { return { person: parseMeeting(context.recResult).person,
                                                            weekday:parseMeeting(context.recResult).day,
                                                            time: parseMeeting(context.recResult).time,
                         } }),
                    target: "transit"
                    },
                    ...sharedRecognitions(),

                ]},
                ...promptAndAsk( say("Tell me the meeting details.") )
        },
        
        //02
        transit:{
            always: [
                //All slots filled
                { target: 'final', cond: (context) => !!context.person && !!context.weekday && !!context.time },

                //At least one slot unfilled
                { target: 'askMore', cond: (context) => !context.person || !context.weekday || !context.time },

            ]
        },

        //03 
        askMore: {
            on: {
                RECOGNISED: [
                    
                    //Update context as long as parsed grammar object is not undefined
                    // ONLY update unfilled slots (ie, undefined properties)

                    //Missing 1 slot >> update 1 slot:
                    { cond: (context) => !!parseMeeting(context.recResult) && !!context.weekday && !!context.time,
                      actions: assign((context) => { return { person: parseMeeting(context.recResult).person}  } ),
                      target: "transit"   },
                    { cond: (context) => !!parseMeeting(context.recResult) && !!context.person  && !!context.time,
                      actions: assign((context) => { return { weekday: parseMeeting(context.recResult).day}  } ),
                      target: "transit"   },
                    { cond: (context) => !!parseMeeting(context.recResult) && !!context.person && !!context.weekday,
                      actions: assign((context) => { return { time: parseMeeting(context.recResult).time}  } ),
                      target: "transit"   },

                    //Missing 2 slots >> update 2 slots:
                    { cond: (context) => !!parseMeeting(context.recResult) && !context.person && !context.weekday,
                        actions: assign((context) => { return { person: parseMeeting(context.recResult).person, weekday: parseMeeting(context.recResult).day}  } ),
                        target: "transit"   },
                    { cond: (context) => !!parseMeeting(context.recResult) && !context.person && !context.time,
                        actions: assign((context) => { return { person: parseMeeting(context.recResult).person, time: parseMeeting(context.recResult).time}  } ),
                        target: "transit"   },
                    { cond: (context) => !!parseMeeting(context.recResult) && !context.weekday && !context.time,
                        actions: assign((context) => { return { weekday: parseMeeting(context.recResult).day, time: parseMeeting(context.recResult).time}  } ),
                        target: "transit"   },
                    
                    //Missing 3 slots: 
                    ...sharedRecognitions(),

                ]},
            ...promptAndAsk( send((context) => ({ type: "SPEAK", value: whatsMissing(context)+knownSoFar(context)+'?' })) )

        },

        //04
        final:{
            on: {
                RECOGNISED: [
                    { cond: (context) => sayYes(context.recResult)===true, target: "done"   },
                    { cond: (context) => sayNo(context.recResult)===true, target: "restart"   }, 
                    ...sharedRecognitions(),

                ]},
            ...promptAndAsk( send((context) => ({ 
                type: "SPEAK", 
                value: `Meeting ${knownSoFar(context)}. Was that correct?` 
                })) )
        },

        //05
        done: {
            entry: say("Great, your appointment has been made."), 
            on: { ENDSPEECH: "#root.dm.init" } 
           },
        
    },

})