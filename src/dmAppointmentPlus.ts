import { MachineConfig, send, Action, assign, } from "xstate";
import { actions } from 'xstate';
const { cancel } = actions;
const cancelTimeout = cancel('timeout');

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))  }

function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN') }


function sharedRecognitions() {
    return [ 
        
        { target: '#root.dm.help', cond: (context:SDSContext) =>  needHelp(context.recResult) },
        { target: ".nomatch" }
        ]
}
function promptAndAsk({ promptMsg, question, prompt2 }: { promptMsg: Action<SDSContext, SDSEvent>; question: string; prompt2:string }): 
MachineConfig<SDSContext, any, SDSEvent> {
    return ({
        initial: 'prompt',
        //childs
        states: {
            //Get voice input; reset counter (ignore the counts from previous state)
            prompt: { entry: promptMsg,  on: { ENDSPEECH: {cond: () => resetCounter()===true, target:"question" }}  },
            question: {entry: say(question),  on: { ENDSPEECH: "ask" } },
            ask: { entry:[listen(), send("TIMEOUT", {delay:7500, id: 'timeout'})],  
                },
            //Fallback states
            //*TECH ISSUE...? say() won't work unless mic is off (when not listening), which depends on a RECOGNISED event being sent first
                // >>But upon RECOGNISED, it will say(reprompt) then go straight to .nomatch
                // >>> Causes another silence when going to dm.goodbye ( say() in goodbye not heard...? )
                
            promptAgain: {entry: [send("RECOGNISED"), say(prompt2)], 
                    always: [
                        //if counter<3: counter++ & go to prompt-again state
                        {cond: () => counter() < 3, target:"question"},
                        //elif counter>=3: go to init state
                        {target:"#root.dm.goodbye"}
                         ] 
                              
                },
                
            nomatch: { entry: [say("Sorry, I didnt get that")],  
                       on: { ENDSPEECH: "question" } 
                    },    
        }
    })
}

//Counter for timeout state
let count=0
function counter(){
    count+=1
    return count
}
function resetCounter(){
    count=0
    return true
}
//test
// console.log(counter()) //1
// console.log(counter()) //2
// console.log(counter()) //3
// resetCounter()
// console.log(counter()) //1


let needHelp = function(text:string):boolean{
    let helpwords = ['help','I need help', 'help me']
    return helpwords.includes(text) };


const grammar: { [index:string]: { person?:string, weekday?:string, time?:string, } } = 
{   
    // 'input_phrase: {keytype: 'value'}
    //People
    "John": { person: "John Appleseed"}, "Goofy": { person: "Goofy Dog"},
    "Mickey": { person: "Mickey Mouse"},"Minnie": { person: "Minnie Mouse"},
    "Donald": { person: "Donald Duck"},"Daisy": { person: "Daisy Duck"},
    "Lisa": { person: "Lisa Simpson"},"Homer": { person: "Homer Simpson"},
    "Monty": { person: "Montgomery Burns"},"Apu": { person: "Apu Nahasapeemapetilon"},

    //Days of week
    "on Monday": { weekday: "Monday" }, "on Tuesday": { weekday: "Tuesday" }, "on Wednesday": { weekday: "Wednesday" },
    "on Thursday": { weekday: "Thursday" }, "on Friday": { weekday: "Friday" }, "on Saturday": { weekday: "Saturday" },
    "on Sunday": { weekday: "Sunday" }, 
    "Monday": { weekday: "Monday" }, "Tuesday": { weekday: "Tuesday" }, "Wednesday": { weekday: "Wednesday" },
    "Thursday": { weekday: "Thursday" }, "Friday": { weekday: "Friday" }, "Saturday": { weekday: "Saturday" },
    "Sunday": { weekday: "Sunday" }, 

    //Time of day
    "1":{time:"13:00"}, "2":{time:"14:00"}, "3":{time:"15:00"}, "4":{time:"16:00" },
    "5":{time:"17:00"}, "6":{time:"18:00"}, "7":{time:"19:00"}, "8":{time:"20:00" },
    "9":{time:"21:00"}, "10":{time:"22:00"}, "11":{time:"15:00"}, "12":{time:"00:00" },
    "at 1":{time:"13:00"}, "at 2":{time:"14:00"}, "at 3":{time:"15:00"}, "at 4":{time:"16:00" },
    "at 5":{time:"17:00"}, "at 6":{time:"18:00"}, "at 7":{time:"19:00"}, "at 8":{time:"20:00" },
    "at 9":{time:"21:00"}, "at 10":{time:"22:00"}, "at 11":{time:"23:00"}, "at 12":{time:"00:00" },
}

const yes_or_no: { [index:string]:{yes_no?:boolean} } = 
{
    "yes": {yes_no: true}, "of course": {yes_no: true}, "sure": {yes_no: true}, "absolutely": {yes_no: true},
    "yeah": {yes_no: true}, "yep": {yes_no: true}, "okay": {yes_no: true},
    "no": {yes_no: false}, "nope": {yes_no: false}, "no thanks": {yes_no: false}, "nah": {yes_no: false},

}


//STATE MACHINE

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {

        //Come here on recognising 'help'; 
        //then go back to last appointment.mainstate (stored in appointment.history)
        help: {
            entry: say("I am here if you need help."),
            on: { ENDSPEECH: '#root.dm.appointment.history' }
            },
        goodbye: {entry: say("You were silent for too many times. Bye for now."), 
                          
                    //Reset counter and go to init
                     always: {cond: () => resetCounter()===true, target:"#root.dm.init"} 
            },
        
        
        //State Idle
        init: { 
            on: {CLICK: 'welcome'} 
            },

        //state 0; greeting message
        welcome: {
            entry: say("Hello, lets create a meeting."),
            on: { ENDSPEECH: 'appointment' }
            },

        appointment :{
            initial: "who",
            states: {
        
        //History of appointment making      
        history: {type:'history', history:'shallow'},

        //State Q1
        who: {
            on: {
                RECOGNISED: [
                    {
                    cond: (context) => "person" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                    target: "day"
                    },
                    ...sharedRecognitions(),
                    ], 
                TIMEOUT:".promptAgain",
                },
                ...promptAndAsk({
                        promptMsg: send((context) => ({
                            type: "SPEAK",
                            value: ""
                        })), question: 'Who are you meeting with?', prompt2: 'You can say Mickey or Minnie for example'
                    })  
            },

        //State Q2
        day: {
            on: {
                RECOGNISED: [
                    {
                    cond: (context) => "weekday" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { weekday: grammar[context.recResult].weekday } }),
                    target: "how_long"
                    },...sharedRecognitions(),
                    ],
                TIMEOUT:".promptAgain",
                },
                ...promptAndAsk({
                        promptMsg: send((context) => ({
                            type: "SPEAK",
                            value: `OK. ${context.person}.`
                        })), question: 'On which day is your meeting?', prompt2: 'Say a day of the week'
                    })

            },

        //State Q3
        how_long: {
            on: { 
                RECOGNISED: [
                    // Yes
                    {cond: (context) => "yes_no" in (yes_or_no[context.recResult] || {}) 
                                        && yes_or_no[context.recResult].yes_no === true,
                    target: 'confirm_whole_day' },
                    // No
                    {cond: (context) => "yes_no" in (yes_or_no[context.recResult] || {}) 
                                        && yes_or_no[context.recResult].yes_no === false,
                    target: 'what_time'},
                    ...sharedRecognitions(),
                    ],
                TIMEOUT:".promptAgain",
                },
                ...promptAndAsk({
                        promptMsg: send((context) => ({
                            type: "SPEAK",
                            value: `OK. on ${context.weekday}.`
                        })), question: 'Will it take the whole day?', prompt2:'Say yes or no'
                    })
            },
        
        //State Q4: one-step confirmation
        confirm_whole_day: {
            on: {
                RECOGNISED: [
                    // Yes
                    {cond: (context) => "yes_no" in (yes_or_no[context.recResult] || {}) 
                                        && yes_or_no[context.recResult].yes_no === true,
                    target: 'done' },
                    // No
                    {cond: (context) => "yes_no" in (yes_or_no[context.recResult] || {}) 
                                        && yes_or_no[context.recResult].yes_no === false,
                    target: 'who'},
                    ...sharedRecognitions(),
                    ],
                TIMEOUT:".promptAgain",
                },
                ...promptAndAsk({
                        promptMsg: send((context) => ({
                            type: "SPEAK",
                            value: `Alright. Meeting ${context.person} on ${context.weekday} for the whole day.`
                        })), question: 'Shall I create a whole-day appointment?', prompt2:'Say yes or no'
                    })
            },

        //Two-steps confirmation
        //State Q4a
        what_time: {
            on: {
                RECOGNISED: [
                    {
                    cond: (context) => "time" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { time: grammar[context.recResult].time } }),
                    target: "confirm_with_time"
                    },...sharedRecognitions(),
                    ],
                TIMEOUT:".promptAgain",
                },
                ...promptAndAsk({
                        promptMsg: send((context) => ({
                            type: "SPEAK",
                            value: `At what time is your meeting?`
                        })), question: 'Say an hour of the day.', prompt2:'You may say at 1, at 2, and so on'
                    })
                
            },

        //State Q4b
        confirm_with_time: {
            on: {
                RECOGNISED: [
                    // Yes
                    {cond: (context) => "yes_no" in (yes_or_no[context.recResult] || {}) 
                                        && yes_or_no[context.recResult].yes_no === true,
                    target: 'done' },
                    // No
                    {cond: (context) => "yes_no" in (yes_or_no[context.recResult] || {}) 
                                        && yes_or_no[context.recResult].yes_no === false,
                    target: 'who'},...sharedRecognitions(),
                    ],
                TIMEOUT:".promptAgain",
                },
                ...promptAndAsk({
                        promptMsg: send((context) => ({
                            type: "SPEAK",
                            value: `Alright. Meeting ${context.person} on ${context.weekday} at ${context.time}.`
                        })), question: 'Shall I create the appointment?', prompt2:'Say yes or no'
                    })
            },
        //State 5
        done: {
             entry: say("Great, your appointment has been made."), 
             on: { ENDSPEECH: "#root.dm.init" } 
            },
        }

    }//End of Appointment State
    }
}
)
