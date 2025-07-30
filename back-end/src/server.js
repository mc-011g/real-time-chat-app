import express from 'express';
import { MongoClient, ServerApiVersion, ObjectId, UUID } from 'mongodb';
import admin from 'firebase-admin';
import fs from 'fs';
import 'dotenv/config';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

const credentials = JSON.parse(fs.readFileSync('/etc/secrets/firebase-credentials.json'));

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.BASE_URL
    }
});

app.use(express.json());

let db;

async function connectToDB() {
    const uri = !process.env.ATLAS_URI
        ? 'mongodb://127.0.0.1:27017'
        : process.env.ATLAS_URI;

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    });

    await client.connect();
    db = client.db(process.env.DB_NAME);
}

//Register
app.post('/api/users/auth/register', async (req, res) => {
    const { id, email, firstName, lastName } = req.body;

    if (!id || !email || !firstName || !lastName) {
        res.status(400).json({ error: "Form submission invalid." });
        return;
    }

    if (typeof email !== 'string' ||
        typeof firstName !== 'string' ||
        typeof lastName !== 'string') {
        res.status(400).json({ error: "Form submission invalid." });
        return;
    }

    if (email.length < 3 || email.length > 50) {
        res.status(400).json({ error: "Email must be between 3 and 50 characters long." });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        res.status(400).json({ error: "Invalid email format." });
        return;
    }

    if (firstName.length < 2 || firstName.length > 50) {
        res.status(400).json({ error: "First name must be between 1-50 characters." })
        return;
    }

    if (lastName.length < 2 || lastName.length > 50) {
        res.status(400).json({ error: "Last name must be between 1-50 characters." })
        return;
    }

    try {
        const existingUser = await db.collection('users').findOne({ email: email });
        if (existingUser) {
            res.status(400).json({ error: "A user exists with this email already. " });
            return;
        }

        const colors = ['orange', 'blue', 'red', 'green'];
        const pickedColor = colors[Math.floor(Math.random() * colors.length)];

        await db.collection('users').insertOne(
            {
                _id: id,
                email: email,
                firstName,
                lastName,
                groupIds: [],
                bgColor: pickedColor
            }
        );
        res.sendStatus(201);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

//Token required at this point
app.use(async function (req, res, next) {
    const { authtoken } = req.headers;

    if (authtoken) {
        try {
            const user = await admin.auth().verifyIdToken(authtoken);

            if (!user.email_verified) {
                res.sendStatus(403);
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.sendStatus(401);
        }
    } else {
        res.sendStatus(400);
    }
});

//Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected!');

    socket.on('join-group', (groupId) => {
        socket.join(groupId);
        console.log('User joined group: ' + groupId);
    });

    socket.on('send-message', (message, groupId) => {
        console.log('Send message, ' + message + ' to group: ' + groupId);
        io.to(groupId).emit('send-message', message);
    })

    socket.on('leave-group', (groupId) => {
        socket.leave(groupId);
        console.log('User left group: ' + groupId);
    })

    socket.on('change-group-name', (newName, groupId) => {
        console.log('Changed group!, ', newName, ' ', groupId);
        io.emit('change-group-name', newName, groupId);
    })

    socket.on('delete-group', (groupId) => {
        io.emit('delete-group', groupId);
    })

    socket.on('add-user-to-group', (groupId, user) => {
        io.to(groupId).emit('add-user-to-group', groupId, user);
    })

    socket.on('remove-user-from-group', (userId, groupId) => {
        io.to(groupId).emit('remove-user-from-group', groupId, userId);
    })

    socket.on('update-group-participant', (user) => {
        io.emit('update-group-participant', user);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
});

app.get('/api/user/profile', async (req, res) => {
    const { uid } = req.user;

    try {
        const userDetails = await db.collection('users').findOne({ _id: uid });

        if (!userDetails) {
            res.sendStatus(404);
            return;
        }

        res.json(userDetails);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});


app.put('/api/user/profile', async (req, res) => {
    const { uid } = req.user;
    const { email, firstName, lastName } = req.body;

    if (typeof email !== 'string' ||
        typeof firstName !== 'string' ||
        typeof lastName !== 'string') {
        res.status(400).json({ error: "Form submission invalid." });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        res.status(400).json({ error: "Invalid email format." });
        return;
    }

    if (email.length < 3 || email.length > 50) {
        res.status(400).json({ error: "Email must be between 3 and 50 characters long." });
        return;
    }

    if (firstName.length < 2 || firstName.length > 50) {
        res.status(400).json({ error: "First name must be between 2 and 50 characters long." });
        return;
    }

    if (lastName.length < 2 || lastName.length > 50) {
        res.status(400).json({ error: "Last name must be between 2 and 50 characters long." });
        return;
    }

    try {
        const updatedUserDetails = await db.collection('users').findOneAndUpdate({ _id: uid }, {
            $set: {
                email,
                firstName,
                lastName
            }
        }, {
            returnDocument: 'after',
        });

        if (!updatedUserDetails) {
            res.sendStatus(404);
            return;
        }

        res.status(201).json(updatedUserDetails);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.post('/api/chat/group/:id/create-invitation', async (req, res) => {
    const { id: groupId } = req.params;
    const { uid } = req.user;

    try {
        const inviteId = uuidv4();

        //Check if user is in group first
        const group = await db.collection('groups').findOne({ _id: new ObjectId(groupId), userIds: { $in: [uid] } });

        if (!group) {
            res.sendStatus(404);
            return;
        }

        const newInviteLink = await db.collection('invitations').insertOne({
            url: process.env.BASE_URL + '/join-group/' + inviteId,
            groupId: groupId,
            valid: true,
            inviteId: inviteId.toString()
        });

        const inviteLink = await db.collection('invitations').findOne({ _id: newInviteLink.insertedId });

        if (!inviteLink) {
            res.sendStatus(404);
            return;
        }

        res.json(inviteLink);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create invitation. Please try again later" });
    }
});

app.put('/api/groups/invitation/:id', async (req, res) => {
    const { id: inviteId } = req.params;
    const { uid } = req.user;

    try {
        const invitation = await db.collection('invitations').findOne({ inviteId: inviteId });

        if (!invitation || !invitation.valid) {
            res.sendStatus(404);
            return;
        }

        const updatedGroup = await db.collection('groups').findOneAndUpdate({ _id: new ObjectId(invitation.groupId), userIds: { $nin: [uid] } }, {
            $push: {
                userIds: uid
            }
        }, {
            returnDocument: 'after'
        });

        if (!updatedGroup) {
            res.status(400).json({ error: "You are already in this group." });
            return;
        }

        const updatedUser = await db.collection('users').findOneAndUpdate({ _id: uid }, {
            $push: {
                groupIds: updatedGroup._id
            }
        }, {
            returnDocument: 'after'
        });

        if (!updatedUser) {
            res.sendStatus(404);
            return;
        }

        const updatedInvitation = await db.collection('invitations').findOneAndUpdate({ _id: new ObjectId(invitation._id) }, {
            $set: {
                valid: false
            },
        }, {
            returnDocument: 'after'
        });

        if (!updatedInvitation) {
            res.sendStatus(404);
            return;
        }

        res.json({ user: updatedUser, group: updatedGroup });

    } catch (error) {
        res.status(500).json({ error: "Failed to join group. Please try again later." });
    }
});

//Get message user data from a group
app.get('/api/chat/group/:id/messageUserInfo', async (req, res) => {
    const { uid } = req.user;
    const { id: groupId } = req.params;

    try {
        const group = await db.collection('groups').findOne({ _id: new ObjectId(groupId), userIds: { $in: [uid] } });
        const { messages } = group;

        if (!group || !messages || messages.length === 0) {
            res.sendStatus(404);
            return;
        }

        const userIds = [...new Set(messages.map(message => message.userId))];

        const result = await db.collection('users').find({ _id: { $in: userIds.map(id => id) } }, { projection: { firstName: 1, lastName: 1, bgColor: 1 } }).toArray();

        res.json(result);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/api/chat/group/:id/messages', async (req, res) => {
    const { uid } = req.user;
    const { id: groupId } = req.params;

    try {
        const group = await db.collection('groups').findOne({ _id: new ObjectId(groupId), userIds: { $in: [uid] } });

        if (!group) {
            res.sendStatus(404);
            return;
        }

        const groupMessages = await db.collection('messages').find({ groupId }).toArray();
        res.json(groupMessages);

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
})

app.get('/api/user/groups', async (req, res) => {
    const { uid } = req.user;

    try {
        const user = await db.collection('users').findOne({ _id: uid });
        const { groupIds } = user;

        if (!user || !groupIds || groupIds.length === 0) {
            res.sendStatus(404);
            return;
        }

        const groupList = await db.collection('groups').find(
            { _id: { $in: groupIds.map(_id => _id) } }
        ).toArray();

        res.json(groupList);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/api/chat/group/:id/participants', async (req, res) => {
    const { id: groupId } = req.params;
    const { uid } = req.user;

    try {
        const group = await db.collection('groups').findOne({ _id: new ObjectId(groupId), userIds: { $in: [uid] } });

        if (!group) {
            res.sendStatus(404);
            return;
        }

        const participants = await db.collection('users').find({ _id: { $in: group.userIds.map(_id => _id) } }, { projection: { firstName: 1, lastName: 1, bgColor: 1 } }).toArray();

        if (!participants) {
            res.sendStatus(404);
            return;
        }

        res.status(200).json(participants);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/api/chat/group/:id', async (req, res) => {

    const { id: groupId } = req.params;
    const { uid } = req.user;

    try {
        const group = await db.collection('groups').findOne({ _id: new ObjectId(groupId), userIds: { $in: [uid] } });

        if (!group) {
            res.sendStatus(404);
            return;
        }

        const selectedGroupId = group._id;

        res.json(selectedGroupId);

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.post('/api/chat/group/:id/send-message', async (req, res) => {
    const { id: groupId } = req.params;
    const { uid } = req.user;
    const { message } = req.body;

    const newMessage = {
        content: message.content,
        dateSent: new Date(),
        userId: uid,
        senderFirstName: message.senderFirstName,
        senderLastName: message.senderLastName,
        groupId,
        bgColor: message.bgColor
    }


    if (!newMessage.content || !newMessage.senderFirstName || !newMessage.senderLastName || !newMessage.groupId || !newMessage.bgColor) {
        res.status(400).json({ error: "Invalid message." });
        return;
    }

    if (typeof newMessage.content !== "string" ||
        !(newMessage.dateSent instanceof Date) ||
        typeof newMessage.userId !== "string" ||
        typeof newMessage.senderFirstName !== "string" ||
        typeof newMessage.senderLastName !== "string" ||
        typeof newMessage.groupId !== "string" ||
        typeof newMessage.bgColor !== "string"
    ) {
        res.status(400).json({ error: "Invalid message." });
        return;
    }

    if (newMessage.content.length < 1 || newMessage.content.length > 200) {
        res.status(400).json({ error: "Message must be less than 200 characters." });
        return;
    }

    if (newMessage.content.length < 1 || newMessage.content.length > 200) {
        res.status(400).json({ error: "Message must be less than 200 characters." });
        return;
    }

    try {
        await db.collection('messages').insertOne(newMessage);
        res.json(newMessage);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.post('/api/chat/group', async (req, res) => {
    const { uid } = req.user;
    const { name } = req.body;

    if (!name || name.length < 1 || name.length > 50) {
        res.status(400).json({ error: "Group name must be between 1-50 characters." })
        return;
    }

    if (typeof name !== 'string') {
        res.status(400).json({ error: "Group name invalid." });
        return;
    }

    try {
        const result = await db.collection('groups').insertOne(
            {
                name,
                owner: uid,
                userIds: [uid]
            }
        );

        const newGroup = await db.collection('groups').findOne({ _id: result.insertedId });

        await db.collection('users').updateOne({ _id: uid }, {
            $push: { groupIds: newGroup._id }
        })

        res.json(newGroup);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.delete('/api/chat/group/:id', async (req, res) => {
    const { uid } = req.user;
    const { id } = req.params;

    try {
        if (!id) {
            res.status(404).json({ error: "Error deleting group." });
            return;
        }

        const deletedGroup = await db.collection('groups').findOneAndDelete({ _id: new ObjectId(id), owner: uid });

        if (!deletedGroup) {
            res.status(404).json({ error: "Error deleting group." });
            return;
        }

        res.json(deletedGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected error occured." });
    }
});

app.put('/api/chat/group/:id', async (req, res) => {
    const { uid } = req.user;
    const { id: groupId } = req.params;
    const { newName } = req.body;

    if (!newName || newName.length < 1 || newName.length > 50) {
        res.status(400).json({ error: "Group name must be between 1-50 characters." });
        return;
    }

    if (typeof newName !== 'string') {
        res.status(400).json({ error: "Group name invalid." });
        return;
    }

    try {
        const group = await db.collection('groups').findOne({ _id: new ObjectId(groupId), owner: uid });

        if (!group) {
            res.sendStatus(404);
            return;
        }

        const updatedGroup = await db.collection('groups').findOneAndUpdate({ _id: group._id }, {
            $set: { name: newName },
        }, {
            returnDocument: 'after',
        });

        res.json(updatedGroup);
    } catch (error) {
        console.error(error);
        res.sendStatus(404);
    }
});

app.put('/api/chat/group/:id/users', async (req, res) => {
    const { uid } = req.user;
    const { id: groupId } = req.params;

    try {
        const updatedGroup = await db.collection('groups').findOneAndUpdate({ _id: new ObjectId(groupId), userIds: { $in: [uid] } }, {
            $pull: {
                userIds: uid
            }
        });

        if (!updatedGroup) {
            res.sendStatus(404);
            return;
        }

        await db.collection('users').updateOne({ _id: uid }, {
            $pull: { groupIds: new ObjectId(groupId) }
        }, {
            returnDocument: 'after'
        });

        res.json(updatedGroup._id);
    } catch (error) {
        console.error(error);
        res.sendStatus(404);
    }
});

const PORT = process.env.PORT || 8080;

async function start() {
    await connectToDB();
    server.listen(PORT, () => console.log('Server is listening on port ' + PORT));
}

start();