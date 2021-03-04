/*

$root mymeeting

$mymeeting [$Please] [$Meet] [$Person] [$Day] [$Time] [$Please];

$Please please|thanks|thank you ...
$Meet meet|create a meeting with| I'm meeting ...
$Person [with] Donald|Mickey|... 
$Day [on] Monday|Tuesday|Wednesday...
$Time [at] noon|1|2|... [a.m.|p.m.] | [for][the] all day|whole day|entire day

>>Returns Object.meeting.person/day/time;  a property=undefined if an item is not mentioned
>>When saying 2 or more items, person-day-time may be in any order (eg, 'at 10 with Mickey' also works)
**Names of people are lowercase as ASR applies sentence capitalisation, which causes SRGS to fail to recognise 'Meet...',
  so I lowercase all the recognised strings in dmAppointmentPro

*/

export const grammar = `
<grammar root="mymeeting">
  <rule id="mymeeting">
    
    <item repeat="0-"><ruleref uri="#Politeness"/></item>
	
    <item repeat="0-1"><ruleref uri="#MakeMeeting"/></item>

    <!--Six different orders-->
    <one-of>  
        <item> <item repeat="0-1"><ruleref uri="#person"/></item><item repeat="0-1"><ruleref uri="#day"/></item><item repeat="0-1"><ruleref uri="#time"/></item> </item>
        <item> <item repeat="0-1"><ruleref uri="#person"/></item><item repeat="0-1"><ruleref uri="#time"/></item><item repeat="0-1"><ruleref uri="#day"/></item> </item> 
        <item> <item repeat="0-1"><ruleref uri="#day"/></item><item repeat="0-1"><ruleref uri="#person"/></item><item repeat="0-1"><ruleref uri="#time"/></item> </item>
        <item> <item repeat="0-1"><ruleref uri="#day"/></item><item repeat="0-1"><ruleref uri="#time"/></item><item repeat="0-1"><ruleref uri="#person"/></item> </item>
        <item> <item repeat="0-1"><ruleref uri="#time"/></item><item repeat="0-1"><ruleref uri="#day"/></item><item repeat="0-1"><ruleref uri="#person"/></item> </item>
        <item> <item repeat="0-1"><ruleref uri="#time"/></item><item repeat="0-1"><ruleref uri="#person"/></item><item repeat="0-1"><ruleref uri="#day"/></item> </item>   
    </one-of>
    
    <item repeat="0-"><ruleref uri="#Politeness"/></item>
    
    <tag>
     out.meeting=new Object();
     out.meeting.person= rules.person; 
     out.meeting.day= rules.day; 
     out.meeting.time= rules.time; 
    </tag>
    
  </rule> 

   //Polite Expressions//
   <rule id="Politeness">
        <one-of>  
            <item> please </item> <item> thanks </item> <item> thank you </item> 
			<item> could you </item> <item> would you </item> <item> can you </item> 
			<item> will you </item> 
        </one-of>
   </rule>

  
   //Make Meeting Command//
   <rule id="MakeMeeting">
        <one-of>  
            <item> create a meeting </item> <item> create an appointment </item> 
			<item> make a meeting </item> <item> make an appointment </item>
            <item> we have a meeting </item> <item> have a meeting </item>
            <item> i am meeting </item> <item> i'm meeting </item> <item> meet </item> <item> i have a meeting </item>
            <item> meeting </item> 
        </one-of>
   </rule>

   //People//
   <rule id="person"> <item repeat="0-1">with</item>
        <one-of>  
            
            <item> john <tag> out="John Appleseed" </tag></item>  
            <item> goofy <tag> out="Goofy Dog" </tag></item> 
            <item> mickey <tag> out="Mickey Mouse" </tag></item> 
            <item> minnie <tag> out="Minnie Mouse" </tag></item> 
            <item> donald <tag> out="Donald Duck" </tag></item> 
            <item> daisy <tag> out="Daisy Duck" </tag></item> 
            <item> lisa <tag> out="Lisa Simpson" </tag></item> 
            <item> homer <tag> out="Homer Simpson" </tag></item> 
            <item> monty <tag> out="Montgomery Burns" </tag></item> 
            <item> apu <tag> out="Apu Nahasapeemapetilon" </tag></item> 

        </one-of>
   </rule>
   
   //Days//
    <rule id="day"> <item repeat="0-1">on</item>
        <one-of> 
            <item> monday </item> <item> tuesday </item> <item> wednesday </item>
            <item> thursday </item> <item> friday </item> <item> saturday </item>
            <item> sunday </item>
        </one-of> 
    </rule>

   //Times//
    <rule id="time"> 
        <one-of> 
            <item>
                <item repeat="0-1">at</item>
                <one-of> 
                    <item> noon <tag>out="12 p.m.";</tag></item> 
                    <item> midnight <tag>out="12 a.m.";</tag></item> 
                    <item>1</item> <item>2</item> <item>3</item> <item>4</item> <item>5</item>
                    <item>6</item> <item>7</item> <item>8</item> <item>9</item> <item>10</item>
                    <item>11</item> <item>12</item>
                </one-of>

                <item repeat="0-1">
                  <one-of> 
                    <item> a.m. </item> <item> p.m. </item>
                  </one-of>
                </item>
            </item>

            <item> <tag> out='whole day'; </tag>
                <item repeat="0-1">for</item>
                <item repeat="0-1">the</item>
                <one-of>
                <item> whole day </item> <item> all day </item> <item> entire day </item>
                </one-of>
            </item>

        </one-of>

    </rule>
   
</grammar>
`
