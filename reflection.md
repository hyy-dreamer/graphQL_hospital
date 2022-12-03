​																											***Testing***



***Name: doctorDetailById():*** Get doctor details (name, clinic name, specialty)

In order to test this query, I need to hardcode the doctor data in memory, and the happy path testing result is as below:

![image-20221202130659331](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202130659331.png)

Since the doctor id is the mandatory filed in this query and the input id should be valid, which means the input doctor id should be in the database, if I choose to enter a doctor id which is not in the database, my APIs has the customized exception handling shown as below:

![image-20221202130625725](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202130625725.png)



***

***Name: doctorAvailableTimeById():*** Get doctor’s available timeslots for today

The input is the doctor id. The happy path is shown as below:

![image-20221202130858752](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202130858752.png)

Since the doctor id is the mandatory filed in this query and the input id should be valid, which means the input doctor id should be in the database, if I choose to enter a doctor id which is not in the database, my APIs has the customized exception handling shown as below:

![image-20221202131047580](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202131047580.png)



***

***Name: bookAppointment():*** Book an appointment with a doctor for today

Before executing the functions, I do 4 error checks:

- check doctor id: the input doctor id should be in the database
- check patitent id: the input patient id should be in the database
- check time format: the input time should be in "hh:mm" format
- check whether the doctor has time available for the input time.

Happy path:

![image-20221202132859551](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202132859551.png)

If the event is created we can see the newly added in event in the event list database:

![image-20221202133536686](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202133536686.png)

And also the calendar(add event to doctor's calendar) and available time(remove booked timeslot from available time) field is updated based on the event:

![image-20221202133824314](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202133824314.png)

Doctor id not valid(only have id with 1 or 2 in the database):

![image-20221202133020318](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202133020318.png)

Patient id not valid(only have id with 1 or 2 in the database):

![image-20221202133056067](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202133056067.png)

Time is not available for the given doctor:

![image-20221202133200823](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202133200823.png)

Input time format is wrong:

![image-20221202133341197](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202133341197.png)



***

***Name: cancelAppointmentById():*** Cancel an appointment(event) by id

Happy path:

![image-20221202134321239](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202134321239.png)

Cancel an appointment with an invalid Id, the error handling is customized:

![image-20221202135256293](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202135256293.png)

***

***Name: updatePatientNameByAppointmentId():*** Update name of the patient for an appointment

Happy path:

![image-20221202140328273](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202140328273.png)

Input Invalid appointment id and the error message is customized:

![image-20221202140632539](/Users/yuyanghuang/Library/Application Support/typora-user-images/image-20221202140632539.png)





​																									***Reflection***

- What were some of the alternative schema and query design options you considered? Why did you choose the selected options? 

  Currently, I am seperating patient, event, and doctor schema which is declared as below:

  ```
  type Doctor {
      id: ID!
      doctorName: String!
      clinic: String!
      specialty: SpecialtyType!
      avaliableTime: [String]
      calendar: [Event]
  }
  
  type Event {
      id: ID!
      doctorID: ID!
      patientID: ID!
      patientName: String!
      time: String!
  }
  
  type Patient{
      id: ID!
      patientName: String!
  }
  
  ```

The reason I am sperating these three type is that it can be easily stored in the database with three tables. one table called doctor, the one called patient and a joined table named event with the patient id and event id as the foreign keys. In contrast to those which have too many fileds in one type, this kind of schema can be easy to change and modify.



- Consider the case where, in future, the ‘Event’ structure is changed to have more fields e.g reference to patient details, consultation type (first time/follow-up etc.) and others.   
  ○ What changes will the clients (API consumer) need to make to their existing queries (if any).


   Answer: If the client wants to 
  ○ How will you accommodate the changes in your existing Schema and Query types? 

  

- Describe two GraphQL best practices that you have incorporated in your API design. 