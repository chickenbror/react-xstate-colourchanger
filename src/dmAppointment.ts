import { MachineConfig, send, Action, assign } from "xstate";


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}



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
    "at 9":{time:"21:00"}, "at 10":{time:"22:00"}, "at 11":{time:"15:00"}, "at 12":{time:"00:00" },
}

const yes_or_no: { [index:string]:{yes_no?:boolean} } = 
{
    "yes": {yes_no: true}, "of course": {yes_no: true}, "sure": {yes_no: true}, "absolutely": {yes_no: true},
    "yeah": {yes_no: true}, "yep": {yes_no: true}, "okay": {yes_no: true},
    "no": {yes_no: false}, "nope": {yes_no: false}, "no thanks": {yes_no: false}, "nah": {yes_no: false},

}

const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://guess-the-intent.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
        })
        )
        .then(data => data.json());




export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        //State Idle
        init: { 
            on: {CLICK: 'welcome'} 
            },

        //state 0
        //Ask what to do > rasa(ASRinput) > go to respective state
        
        welcome: {
            initial: "prompt",
            on: {
                RECOGNISED: [ 
                    {
                    target: "parse_intent",
                    actions: assign((context) => { return { command: context.recResult } }),
                    },
                    { target: ".nomatch" }
                    ]
                },
            //welcome child-states
            states: {
                prompt: {
                    entry: say("Hello, what would you like to do?"),
                    on: { ENDSPEECH: "ask" }
                    },
                ask: {entry: listen()},
                nomatch: {
                    entry: say("Sorry I didn't get that."),
                    on: { ENDSPEECH: "prompt" }
                    }
                }   
            },
        
        //Step1- parse command for intent
        parse_intent: {
            invoke: {
                id: 'guess_my_intent',
                src: (context, event) => nluRequest(context.command),
                onDone: {
                    target: 'choices',
                    actions: [assign((context, event) => { return  {command: event.data.intent.name} }),
                            (context: SDSContext, event: any) => console.log(event.data) ]
                    },
                onError: {
                    target: 'welcome',
                    actions: (context, event) => console.log(event.data)
                    }
                }
            },       

        //Step2- map intent to target state
        choices: {
                always:[
                { target: 'todo_list', cond: (context) => context.command === 'todo_item' },
                { target: 'set_timer', cond: (context) => context.command === 'timer' },
                { target: 'make_appointment', cond: (context) => context.command === 'appointment' },
                { target: 'other_intents', cond: (context) => context.command === 'nlu_fallback' }
                ]
            },
            
           
        
        //3+1 choices according to intent
        make_appointment: {
            initial: "prompt",
            on: { ENDSPEECH: "who" },
            states: { prompt: { entry: say("Sure. Let's create an appointment") } }
            },
        todo_list: {
            initial: "prompt",
            on: { ENDSPEECH: "init" },
            states: { prompt: { entry: say("Sure, creating a to-do list for you.") } }
                },
        set_timer: {
            initial: "prompt",
            on: { ENDSPEECH: "init" },
            states: { prompt: { entry: say("Sure, setting a timer for you.") } }
                },
        other_intents: {
            initial: "prompt",
            on: { ENDSPEECH: "welcome" },
            states: { 
                prompt: { 
                    entry: say("I don't know how to do that. But I can make an appointment, make a to do list, or set a timer for you.") 
                    } 
                }
            },

        //State Q1
        who: {
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {
                    cond: (context) => "person" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                    target: "day"
                    },
                    { target: ".nomatch" }
                ]
                },
            //Q1 child-states
            states: {
                prompt: {
                    entry: say("Who are you meeting with?"),
                    on: { ENDSPEECH: "ask" }
                    },
                ask: {entry: listen()},
                nomatch: {
                    entry: say("Sorry I didn't get that."),
                    on: { ENDSPEECH: "prompt" }
                    }
                }
            },
        //State Q2
        day: {
            initial: "pre_prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "weekday" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { weekday: grammar[context.recResult].weekday } }),
                    target: "how_long"
                    },
                    { target: ".nomatch" }  ]
                },
            //Q2 child-states
            states: {
                //Repeat heard name first, then ask for day
                pre_prompt: {
                    entry: send( (context) => ({
                        type: "SPEAK",
                        value: `OK. Meeting ${context.person}.`
                        })),
                    on: { ENDSPEECH: "prompt" }
                    },
                prompt: {
                    entry: send( (context) => ({
                        type: "SPEAK",
                        value: `On which day is your meeting?`
                        })),
                    on: { ENDSPEECH: "ask" }
                    },
                ask: {entry: listen()},
                nomatch: {
                    entry: say("Sorry I didn't get that."),
                    on: { ENDSPEECH: "prompt" }
                    }
                }
            },

        //State Q3
        how_long: {
            initial: "pre_prompt",
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
                    // NoMatch
                    { target: ".nomatch" }
                    ]
                },
            //Q3 child-states
            states: {
                pre_prompt: {
                    entry: send( (context) => ({
                        type: "SPEAK",
                        value: `Ok, on ${context.weekday}.`
                        })),
                    on: { ENDSPEECH: "prompt" }
                    },
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Will it take the whole day?`
                    })),
                    on: { ENDSPEECH: "ask" }
                    },
                ask: {
                    entry: listen()
                    },
                nomatch: {
                    entry: say("Sorry I didn't get that."),
                    on: { ENDSPEECH: "prompt" }
                    }
                }
            },
        
        //State Q4: one-step confirmation
        confirm_whole_day: {
            initial: "prompt",
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
                    // NoMatch
                    { target: ".nomatch" }
                    ]
                },
            //Q4 child-states
            states: {
                prompt: {
                    entry: send( (context) => ({
                        type: "SPEAK",
                        value: `Alright. Shall I make an appointment with ${context.person} on ${context.weekday} for the whole day?`
                        })),
                    on: { ENDSPEECH: "ask" }
                    },
                ask: {
                    entry: listen()
                    },
                nomatch: {
                    entry:
                    send( (context) => ({
                        type: "SPEAK",
                        value: `Sorry I didn't get that. Are you meeting ${context.person} on ${context.weekday} for the whole day?`
                        })),
                    on: { ENDSPEECH: "ask" }
                    }
                }
            },

        //Two-steps confirmation
        //State Q4a
        what_time: {
            initial: "pre_prompt",
            on: {
                RECOGNISED: [
                    {
                    cond: (context) => "time" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { time: grammar[context.recResult].time } }),
                    target: "confirm_with_time"
                    },
                    { target: ".nomatch" }]
                },
            //Q2 child-states
            states: {
                //Repeat heard name first, then ask for day
                pre_prompt: {
                    entry: send( (context) => ({
                        type: "SPEAK",
                        value: `OK.`
                        })),
                    on: { ENDSPEECH: "prompt" }
                    },
                prompt: {
                    entry: send( (context) => ({
                        type: "SPEAK",
                        value: `At what time is your meeting?`
                        })),
                    on: { ENDSPEECH: "ask" }
                    },
                ask: {entry: listen()},
                nomatch: {
                    entry: say("Sorry I didn't get that"),
                    on: { ENDSPEECH: "prompt" }
                    }
                }
            },

        //State Q4b
        confirm_with_time: {
            initial: "prompt",
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
                    // NoMatch
                    { target: ".nomatch" }
                    ]
                },
            //Q4 child-states
            states: {
                prompt: {
                    entry: send( (context) => ({
                        type: "SPEAK",
                        value: `Alright. Shall I make an appointment with ${context.person} on ${context.weekday} at ${context.time}?`
                        })),
                    on: { ENDSPEECH: "ask" }
                    },
                ask: {entry: listen()},
                nomatch: {
                    entry: 
                    send( (context) => ({
                        type: "SPEAK",
                        value: `Sorry I didn't get that. Are you meeting ${context.person} on ${context.weekday} at ${context.time}?`
                        })),
                    on: { ENDSPEECH: "ask" }
                    }
                }
            },
        //State 5
        done: {
            initial: "prompt",
            on: { ENDSPEECH: "init" },
            states: { 
                prompt: { 
                    entry: say("Great, your appointment has been made.") ,
                    },
                }
            },
        

        }
    }
)
