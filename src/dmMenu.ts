import { MachineConfig, send, Action } from "xstate";

//Other dmMachines
import { dmMachine as dmSmartHome } from "./dmSmartHome";
import { dmMachine as dmSearch } from "./dmSearch";
import { dmMachine as dmAppointmentPlus } from "./dmAppointmentPlus";
import { dmMachine as dmAppointmentPro } from "./dmAppointmentPro";
import { dmMachine as dmColourChanger } from "./dmColourChanger";

// SRGS parser and example (logs the results to console on page load)
import { loadGrammar } from './runparser'
import { parse } from './chartparser'
import { grammar } from './grammars/menuGrammar'

const gram = loadGrammar(grammar)

// function paeseCmd() returns formatted str containing .action & .object values
let parseCmd: (text:string) => string = function (
    text: string,
  ): string {
    let prs = parse(text.toLowerCase().split(/\s+/), gram)
    let result = prs.resultsForRule(gram.$root)[0]
    let out= (!!result)? result.intent : result // .intent or undefined
    return out ;
  };

let input1 = "smart home"
let input2 = "lalalala"
console.log(parseCmd(input1)) // .intent==='smarthome'
console.log(parseCmd(input2)) // undefined


const sayResponse: Action<SDSContext, SDSEvent> = send((context: SDSContext) => (
    {type: "SPEAK", value: parseCmd(context.recResult)}
))

function say(text: string): Action<SDSContext, SDSEvent> {
    console.log(`>>Saying: ${text}`)
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}



function promptAndAsk(prompt: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
        initial: 'prompt',
        states: {
            prompt: {
                entry: say(prompt),
                on: { ENDSPEECH: 'ask' }
            },
            ask: {
                entry: send('LISTEN'),
            },
        }
    })
}


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'welcomePrompt'
            }
        },
        

        welcomePrompt: {
            on: {
                RECOGNISED: [
                    { target: 'stop', cond: (context) => context.recResult === 'stop' },
                    { target: 'NotACommand', cond: (context) => !parseCmd(context.recResult)},
                    { target: 'smarthome', cond: (context) => parseCmd(context.recResult) === 'smarthome'},
                    { target: 'search', cond: (context) => parseCmd(context.recResult) === 'search'},
                    { target: 'appointmentPlus', cond: (context) => parseCmd(context.recResult) === 'appointmentPlus'},
                    { target: 'appointmentPro', cond: (context) => parseCmd(context.recResult) === 'appointmentPro'},
                    { target: 'changecolour', cond: (context) => parseCmd(context.recResult) === 'changecolour'},
                    ],
                CLICK: 'stop'
                },
            ...promptAndAsk("Hi, what can I do for you?")
            },
        stop: {
            entry: say("Ok, stopped"),
            always: 'init'
            },
        NotACommand: {
            entry: say("Sorry, I dont know how to do that. I can control smart home, search, make an appointment, or change the colour."),
            on: { ENDSPEECH: "welcomePrompt" }
            },
        
            
        smarthome: { ...dmSmartHome, onDone:"init"},

        search: { ...dmSearch, onDone:"init"},

        appointmentPlus: { ...dmAppointmentPlus, onDone:"init"},

        appointmentPro: { ...dmAppointmentPro, onDone:"init"},

        changecolour: { ...dmColourChanger, onDone: 'init' },
    }
})
