import { MachineConfig, send, Action } from "xstate";

// SRGS parser and example (logs the results to console on page load)
import { loadGrammar } from './runparser'
import { parse } from './chartparser'
import { grammar } from './grammars/commandGrammar'

const gram = loadGrammar(grammar)

// function paeseCmd() returns formatted str containing .action & .object values
let parseCmd: (text:string) => string = function (
    text: string,
  ): string {
    let prs = parse(text.split(/\s+/), gram)
    let result = prs.resultsForRule(gram.$root)[0]
    let message;
    if (result===undefined)
        {message='NotCommand'}
    else
        {let action = result.command.action
        let thing = result.command.object
        let doing;
            if(action==='on'){doing='turning on'} if(action==='off'){doing='turning off'}
            if(action==='open'){doing='opening'} if(action==='close'){doing='closing'}
        message = `Sure, ${doing} the ${thing}.`}
    return message ;
  };

// let input1 = "close the AC please"
// let input2 = "turn off the AC please"
// console.log(parseCmd(input1))
// console.log(parseCmd(input2)) 


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
                    { target: 'NotACommand', cond: (context) => parseCmd(context.recResult) === 'NotCommand'},
                    { target: 'chore', cond: (context) => parseCmd(context.recResult) != 'NotCommand'},
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
            entry: say("Sorry, I dont know how to do that."),
            on: { ENDSPEECH: "welcomePrompt" }
            },
        chore: {
            initial: 'prompt',
            states: {
                prompt: {
                    entry: sayResponse,
                    on: { ENDSPEECH: '#root.dm.init' }
                    },
                
                }
            }
    }
})
