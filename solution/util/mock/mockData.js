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

const getMockFeed = () => {
    return [
        {
            plantId: 5,
            title: "Rose",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 4, 1), // May 1, 2024
            img: "https://source.unsplash.com/random/?plants&page=1",
            numOfComments: 10,
            identification: "Completed"
        },
        {
            plantId: 5,
            title: "Lavender",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 3, 15), // April 15, 2024
            img: "https://source.unsplash.com/random/?plants&page=2",
            numOfComments: 5,
            identification: "In Progress"
        },
        {
            plantId: 5,
            title: "Sunflower",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 5, 1), // June 1, 2024
            img: "https://source.unsplash.com/random/?plants&page=3",
            numOfComments: 8,
            identification: "Completed"
        },
        {
            plantId: 5,
            title: "Fern",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 1, 1), // February 1, 2024
            img: "https://source.unsplash.com/random/?plants&page=4",
            numOfComments: 3,
            identification: "In Progress"
        },
        {
            plantId: 5,
            title: "Succulent",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 6, 1), // July 1, 2024
            img: "https://source.unsplash.com/random/?plants&page=5",
            numOfComments: 2,
            identification: "In Progress"
        },
        {
            plantId: 5,
            title: "Orchid",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 4, 15), // May 15, 2024
            img: "https://source.unsplash.com/random/?plants&page=6",
            numOfComments: 6,
            identification: "In Progress"
        },
        {
            plantId: 5,
            title: "Bamboo",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 2, 15), // March 15, 2024
            img: "https://source.unsplash.com/random/?plants&page=7",
            numOfComments: 4,
            identification: "In Progress"
        },
        {
            plantId: 5,
            title: "Cactus",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 0, 1), // January 1, 2024
            img: "https://source.unsplash.com/random/?plants&page=8",
            numOfComments: 7,
            identification: "In Progress"
        },
        {
            plantId: 5,
            title: "Tulip",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 3, 1), // April 1, 2024
            img: "https://source.unsplash.com/random/?plants&page=9",
            numOfComments: 9,
            identification: "In Progress"
        },
        {
            plantId: 5,
            title: "Maple",
            shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel magna ac sem sagittis pulvinar. Aenean dolor sapien, malesuada ac libero nec, facilisis porttitor nibh. Donec quis blandit magna quis.",
            time: new Date(2024, 8, 15), // September 15, 2024
            img: "https://source.unsplash.com/random/200x200?plants&page=10",
            numOfComments: 1,
            identification: "In Progress"
        }
    ];
}

module.exports ={
    getUserNotifications,
    getMockFeed
}