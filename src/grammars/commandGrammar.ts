/*
  root $mycommand;
  $mycommand = [please] $commandA | $commandB [please];
  
  $commandA = $actionA the $objectA; //electricals
  $commandB = $actionB the $objectB; //house openings
  
  $actionA = turn on | turn off;
  $objectA = AC{out='air conditioning'} | light | heat;
  
  $actionB = open | close;
  $objectB = window | door

*/

export const grammar = `
<grammar root="mycommand">
  <rule id="mycommand">

    <!--Polite expressions before-->
    <item repeat="0-1">can you</item><item repeat="0-1">could you</item><item repeat="0-">please</item> 
    
    <one-of> 
        <!--Make object with 2 properties from either of " ___ the XXX" commands -->

        <item> 
           <ruleref uri="#commandA"/> 
           <tag>
             out.command=new Object();
             out.command.action= rules.commandA.action; 
             out.command.object=rules.commandA.object;
           </tag>
        </item> 

        <item> 
           <ruleref uri="#commandB"/>         
           <tag>
             out.command=new Object();
             out.command.action= rules.commandB.action; 
             out.command.object=rules.commandB.object;
           </tag>
        </item> 
    </one-of>

    <!--Polite expressions after-->
    <item repeat="0-">please</item><item repeat="0-">thanks</item> <item repeat="0-">thank you</item>
  </rule> 


   <!--Electricals-->
   <rule id="commandA"> 
      <ruleref uri="#actionA"/> the <ruleref uri="#objectA"/>
      <tag>
           out.action= rules.actionA; 
           out.object=rules.objectA;
      </tag>
   </rule>
   
   <!-- House openings -->
   <rule id="commandB">  
      <ruleref uri="#actionB"/> the <ruleref uri="#objectB"/>
      <tag>
           out.action= rules.actionB; 
           out.object=rules.objectB;
      </tag>
   </rule>

<rule id="actionA"> 
    <one-of>  
        <item> turn on <tag> out='on'; </tag></item>     <item> switch on <tag> out='on'; </tag></item>
        <item> turn off <tag> out='off'; </tag></item>   <item> switch off <tag> out='off'; </tag></item>
    </one-of>
</rule>
<rule id="objectA"> 
    <one-of> 
        <item> light </item> <item> lights <tag> out = 'light'; </tag></item> 
        <item> heat </item> 
        <item> AC <tag> out = 'air conditioning'; </tag></item>   <item> air conditioning </item>  
    </one-of> 
</rule>

<rule id="actionB"> 
    <one-of>  
        <item> open </item> 
        <item> close </item> 
    </one-of> 
</rule>
<rule id="objectB"> 
    <one-of> 
        <item> window </item> 
        <item> door </item> 
    </one-of> 
</rule>
   
</grammar>
`
