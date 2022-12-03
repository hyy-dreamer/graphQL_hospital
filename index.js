import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql

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

enum SpecialtyType {
    general physician
    gynecologist
    orthopedic
}

type DoctorDetail{
    doctorID: ID!
    doctorName: String!
    clinic: String!
    specialty: SpecialtyType!
}

type DoctorAvailableTime{
    doctorID: ID!
    avaliableTime: [String] 
}

input BookAppointmentInput{
    doctorID: ID!
    patientID: ID!
    time: String!
}

input CreateDoctorInput{
    doctorName: String!
    clinic: String!
    specialty: SpecialtyType!
}

type Query {
    doctor: [Doctor]
    event: [Event]
    patient: [Patient]
    doctorDetailById(id:ID!): DoctorDetail
    doctorAvailableTimeById(id:ID!): DoctorAvailableTime
  }

type Mutation{
    bookAppointment(bookAppointmentInput: BookAppointmentInput!): Event!
    cancelAppointmentById(id:ID!): Event!
    updatePatientNameByAppointmentId(id:ID!, name: String!): Event!
    createDoctor(createDoctorInput: CreateDoctorInput!): Doctor!
    createPatient(createPatientInput: String!): Patient!
}

`;

var events = [
    {
        id: '1',
        doctorID: '1',
        patientID: '1',
        patientName: "Kate",
        time: "16:00"
    },
    {
        id: '2',
        doctorID: '2',
        patientID: '2',
        patientName: "sam",
        time: "16:00"
    },
]

var doctor = [
    {
        id: '1',
        doctorName: 'Kate Chopin',
        clinic: 'clinic 1',
        specialty: 'gynecologist',
        avaliableTime: ["09:00", "10:00"],
        calendar: [events[0]]
    },
    {
        id: '2',
        doctorName: 'Paul Auster',
        clinic: 'clinic 2',
        specialty: 'gynecologist',
        avaliableTime: ["10:00", "11:00"],
        calendar: [events[1]]
    },
  ];


var patient = [
    {
        id: '1',
        patientName: 'Kate Chopin',
    },
    {
        id: '2',
        patientName: 'Paul Auster',
    },
  ];

const resolvers = {
    Query: {
        //get all patients
        patient: () => patient,
        //get all doctors
        doctor: () => doctor,
        //get all the events
        event: () => events,
        // Name: doctorDetailById(): Get doctor details (name, clinic name, specialty)
        doctorDetailById(parent, args, context, info) {
            if(doctor.find((doctor)  => doctor.id === args.id) === undefined) 
            {
                throw new GraphQLError('Doctor id is not found.', {
                    extensions: {
                      code: 'NOT_FOUND',
                    },
                });
            }
            var Detail = 
                {
                    doctorID : doctor.find((doctor)  => doctor.id === args.id).id,
                    doctorName : doctor.find((doctor)  => doctor.id === args.id).doctorName,
                    clinic: doctor.find((doctor)  => doctor.id === args.id).clinic,
                    specialty: doctor.find((doctor)  => doctor.id === args.id).specialty
                };
            
            return Detail;
            // return doctor.find((doctor) => doctor.id === args.id).avaliableTime;
        },

        // Name: doctorAvailableTimeById(): Get doctor’s available timeslots for today
        doctorAvailableTimeById(parent, args, context, info) {
            if(doctor.find((doctor)  => doctor.id === args.id) === undefined) 
            {
                throw new GraphQLError('Doctor id is not found.', {
                    extensions: {
                      code: 'NOT_FOUND',
                    },
                });
            }
            var AvailableTime = {
                doctorID: doctor.find((doctor)  => doctor.id === args.id).id,
                avaliableTime: doctor.find((doctor) => doctor.id === args.id).avaliableTime
            };
            return AvailableTime;
        },
    },

    Mutation: {
        //Name: createDoctor(): create a new doctor in the datebase
        createDoctor: (parent, args, context, info) => {
            var AT = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30","12:00", "12:30", "13:00", "13:30", "14:00",
        "14:30", "15:00", "15:30", "16:00","16:30", "17:00"];
            var d = {
                id: (doctor.length + 1).toString(),
                doctorName: args.createDoctorInput.doctorName,
                clinic: args.createDoctorInput.clinic,
                specialty: args.createDoctorInput.specialty,
                avaliableTime: AT,
                calendar: []
            };
            doctor.push(d);
            return d;
        },

        //name: createPatient(): create a new patient in the database
        createPatient: (parent, args, context, info) => {
            var p = {
                id: (patient.length + 1).toString(),
                patientName: args.createPatientInput,
            }
            patient.push(p);
            return p;
        },



        //Name: bookAppointment(): Book an appointment with a doctor for today
        bookAppointment: (parent, args, context, info) => {
            //check doctor id
            
            if(doctor.find((doctor)  => doctor.id === args.bookAppointmentInput.doctorID) === undefined) 
            {
                throw new GraphQLError('Doctor id is not found.', {
                    extensions: {
                      code: 'NOT_FOUND',
                    },
                });
            }
            //check patient id
            if(patient.find((patient) => patient.id === args.bookAppointmentInput.patientID) === undefined) 
            {
                throw new GraphQLError('Patient id is not found.', {
                    extensions: {
                      code: 'NOT_FOUND',
                    },
                });
            }

            //check time format, should be in "hh:mm" format
            var time = args.bookAppointmentInput.time.match(/^(\d{2}):(\d{2})$/);
            if (time == null ||  parseInt(time[1]) > 23 || parseInt(time[2]) > 59)
            {
                throw new GraphQLError('Time is not valid.', {
                    extensions: {
                      code: 'BAD_REQUEST',
                    },
                });
            }

            //check whether the doctor has time available
            var d = doctor.find((doctor)  => doctor.id === args.bookAppointmentInput.doctorID);
            var cc = -1
            for(var i = 0; i < d.avaliableTime.length; i ++)
            {
                if(d.avaliableTime[i] === args.bookAppointmentInput.time)
                {
                    cc = i;
                    break;
                }
            }
            if(cc == -1)
            {
                throw new GraphQLError('Time is not available for the doctor.', {
                    extensions: {
                      code: 'BAD_REQUEST',
                    },
                });
            }
            else
            {
                d.avaliableTime.splice(cc, 1);
            }
            var e = {
                id: (events.length + 1).toString(),
                doctorID: args.bookAppointmentInput.doctorID,
                patientID: args.bookAppointmentInput.patientID,
                patientName: patient.find((patient) => patient.id === args.bookAppointmentInput.patientID).patientName,
                time: args.bookAppointmentInput.time
            };
            d.calendar.push(e)
            events.push(e);
            return e;
        },

        //Name: cancelAppointmentById(): Cancel an appointment by id
        cancelAppointmentById: (parent, args, context, info) => {
            //check event id
            if(events.find((event) => event.id === args.id) === undefined) 
            {
                throw new GraphQLError('Event id is not found.', {
                    extensions: {
                      code: 'NOT_FOUND',
                    },
                });
            }
            else
            {
                // add to available time
                var dId = events.find((event) => event.id === args.id).doctorID;
                var dd = doctor.find((doctor)  => doctor.id === dId);
                dd.avaliableTime.push(events.find((event) => event.id === args.id).time);
                var index1 = -1;
                for(var i = 0; i < dd.calendar.length; i ++)
                {
                    if(dd.calendar[i].id === args.id)
                    {
                        index1 = i;
                        break;
                    }
                }
                dd.calendar.splice(index1, 1);

                var e = {
                    id: args.id,
                    doctorID: events.find((event) => event.id === args.id).doctorID,
                    patientID: events.find((event) => event.id === args.id).patientID,
                    patientName: events.find((event) => event.id === args.id).patientName,
                    time: events.find((event) => event.id === args.id).time,
                };
                var index = -1;
                for(var i = 0; i < events.length; i ++)
                {
                    if(events[i].id === args.id)
                    {
                        index = i;
                        break;
                    }
                }
                if (index > -1) { 
                    events.splice(index, 1); 
                }
                return e;
            }
        },

        //Name: updatePatientNameByAppointmentId(): Update name of the patient for an appointment
        updatePatientNameByAppointmentId: (parent, args, context, info) => {
            //check event id
            if(events.find((event) => event.id === args.id) === undefined) 
            {
                throw new GraphQLError('Event id is not found.', {
                    extensions: {
                      code: 'NOT_FOUND',
                    },
                });
            }
            else{
                var e = {
                    id: args.id,
                    doctorID: events.find((event) => event.id === args.id).doctorID,
                    patientID: events.find((event) => event.id === args.id).patientID,
                    patientName: args.name,
                    time: events.find((event) => event.id === args.id).time,
                };
                var index
                for(var i = 0; i < events.length; i ++)
                {
                    if(events[i].id === args.id)
                    {
                        index = i;
                        break;
                    }
                }
                if (index > -1) { 
                    events.splice(index, 1); 
                    events.push(e);
                }
                return e;
            }
            
        },
    },
  };

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
  
  console.log(`🚀  Server ready at: ${url}`);