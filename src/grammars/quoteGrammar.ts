export const grammar = `
<grammar root="root">

   <rule id="root">
      <ruleref uri="#quote"/>
      <tag>out.person = new Object(); out.person.quote=rules.quote;</tag>
   </rule>

   <rule id="quote">
      <one-of>
         <item>to do is to be<tag>out="Socrates";</tag></item>
         <item>to be is to do<tag>out="Sartre";</tag></item>
         <item>do be do be do<tag>out="Sinatra";</tag></item>
      </one-of>
   </rule>
   
</grammar>
`
