const getUserNotifications = () => {
    return [
        {
            date: new Date('2024-02-05T08:00:00Z'),
            title: 'FLower 1',
            id: 123,
            time: '08:00:00 AM',
            dateTime: '2024-02-05 08:00:00 AM',
            ownerId: 1,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: false,

        },
        {
            date: new Date('2024-01-15T14:30:00Z'),
            title: 'Flower 2',
            id: 456,
            time: '02:30:00 PM',
            dateTime: '2024-01-15 02:30:00 PM',
            ownerId: 1,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: false,


        },
        {
            date: new Date('2024-03-01T10:45:00Z'),
            title: 'Flower 222',
            id: 789,
            time: '10:45:00 AM',
            dateTime: '2024-03-01 10:45:00 AM',
            ownerId: 1,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: false,


        },
        {
            date: new Date('2024-02-20T17:20:00Z'),
            title: 'Flower 3',
            id: 321,
            time: '05:20:00 PM',
            dateTime: '2024-02-20 05:20:00 PM',
            ownerId: 2,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: false,


        },
        {
            date: new Date('2024-01-10T09:15:00Z'),
            title: 'Flower 22135',
            id: 654,
            time: '09:15:00 AM',
            dateTime: '2024-01-10 09:15:00 AM',
            ownerId: 1,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: true,


        },
        {
            date: new Date('2024-02-25T12:45:00Z'),
            title: 'Flower 1242352',
            id: 987,
            time: '12:45:00 PM',
            dateTime: '2024-02-25 12:45:00 PM',
            ownerId: 7,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: true,


        },
        {
            date: new Date('2024-01-05T11:30:00Z'),
            title: 'Flower 266661',
            id: 135,
            time: '11:30:00 AM',
            dateTime: '2024-01-05 11:30:00 AM',
            ownerId: 7,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: true,


        },
        {
            date: new Date('2024-03-10T16:00:00Z'),
            title: 'Tomato',
            id: 246,
            time: '04:00:00 PM',
            dateTime: '2024-03-10 04:00:00 PM',
            ownerId: 7,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: true,


        },
        {
            date: new Date('2024-02-15T13:20:00Z'),
            title: 'Beef',
            id: 579,
            time: '01:20:00 PM',
            dateTime: '2024-02-15 01:20:00 PM',
            ownerId: 1,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: true,


        },
        {
            date: new Date('2024-03-05T10:10:00Z'),
            title: 'Chicken',
            id: 369,
            time: '10:10:00 AM',
            dateTime: '2024-03-05 10:10:00 AM',
            ownerId: 2,
            content: "Chuck Norris added a comment: \"This plant is such a beautiful fruit...\"",
            seen: true,


        }
    ];
}

const getMockData= () =>{
    return{
        firstName:"Steve",
        lastName:"Jobes",
        addressFirst:"47 Scotland",
        addressSecond:"Mars Campus",
        city:"Space X",
        country:"USA",
        postCode:"Sheffield",
        dateOfBirth:"28.06.2000",
        plantName:"Rose Plant",
        plantDescription:"Large Plants with Flowers",
        location:"Sheffield",
        plantSize:"4 meters",
        plantFlower:"Rose",
        plantCharacteristics:"Green",
        plantFirstSeen:"Sheffield",
        email:"km@gmail.com"
    }
}

module.exports ={
    getUserNotifications,
    getMockData
}