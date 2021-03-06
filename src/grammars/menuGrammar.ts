/*
  root $mycommand;
  $mycommand = [$please] $smarthome | $search | $appointmentPlus |$appontmentPro |$changecolour [$please];
  
  $smarthome 
  $search
  $appointmentPlus
  $appontmentPro


*/

export const grammar = `
<grammar root="mycommand">
  <rule id="mycommand">

    <!--Polite expressions before-->
    <item repeat="0-"><ruleref uri="#Politeness"/></item> 
    
    <one-of> 
        <!--Make object with .intent property -->

        <item>   
          <ruleref uri="#smarthome"/>
          <tag> out= new Object();out.intent= rules.smarthome; </tag>  
        </item> 

        <item>   
          <ruleref uri="#search"/>
          <tag> out= new Object();out.intent= rules.search; </tag>       
        </item>

        <item>   
          <ruleref uri="#appointmentPlus"/>
          <tag> out= new Object();out.intent= rules.appointmentPlus; </tag>  
        </item>

        <item>   
          <ruleref uri="#appointmentPro"/>
          <tag> out= new Object();out.intent= rules.appointmentPro; </tag>     
        </item>

        <item>
            <ruleref uri="#changecolour"/>
            <tag> out= new Object();out.intent= rules.changecolour; </tag>      
        </item>
    </one-of>

    <!--Polite expressions after-->
    <item repeat="0-"><ruleref uri="#Politeness"/></item>



  </rule> 


  //Polite Expressions//
  <rule id="Politeness">
       <one-of>  
           <item> please </item> <item> thanks </item> <item> thank you </item> 
           <item> could you </item> <item> would you </item> <item> can you </item> 
           <item> will you </item> <item> i would like to </item>  <item> i want to </item> 
       </one-of>
  </rule>


  //01 Smart Home//
  <rule id="smarthome">
       <one-of>  
           <item> smart home </item> <item> control my home </item> <item> control my stuff </item> 
           <item> control my house </item> <item> use smart home </item> 
       </one-of>
   <tag> out="smarthome" </tag>
  </rule>

  //02 Search on DuckDuckGo//
  <rule id="search">
       <one-of>  
           <item> search </item> <item> do a search </item> <item> search for something </item> 
           <item> search on the web </item> <item> search on the internet </item> 
       </one-of>
    <tag> out="search" </tag>
  </rule>

  //03 Appointment Plus//
  <rule id="appointmentPlus">
       <one-of>  
           <item> appointment plus </item> <item> make an appointment step by step </item> 
           <item> appointments plus </item> <item> appointment-plus </item>
       </one-of>
   <tag> out="appointmentPlus" </tag>
  </rule>

  //04 Appointment Pro//
  <rule id="appointmentPro">
       <one-of>  
           <item> make an appointment </item> <item> meet someone </item> <item> appointment pro </item> 
           <item> appointment in one go </item> <item> appointment in one step </item> 
           <item> appointments pro </item> <item> appointment-pro </item>
       </one-of>
     <tag> out="appointmentPro" </tag>
  </rule>

  //05 Colour Changer//
  <rule id="changecolour">
       <one-of>  
           <item> color changer </item> <item> change the color </item> <item> change color </item> 
           <item> colour changer </item> <item> change the colour </item> <item> change colour </item> 
       </one-of>
     <tag> out="changecolour" </tag>

  </rule>



   
</grammar>
`
