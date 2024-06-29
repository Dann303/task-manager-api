const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth')
const router = new express.Router();
const mongoose = require('mongoose');


router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save()
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
        
    }
})


// GET /tasks?completed=false maslan
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const options = { sort: {} }

    if (req.query.completed) {
        match.completed = req.query.completed === 'true' // to set it to a boolean
    }

    if (req.query.limit) {
        options.limit = parseInt(req.query.limit)
    }
    
    if (req.query.skip) {
        options.skip = parseInt(req.query.skip)
    }

    if (req.query.sortBy) {
        const words = req.query.sortBy.split(':');
        const sortProperty = words[0];
        const order = words[1] === 'desc' ? -1 : 1
        options.sort[sortProperty] = order
    }
    
    try {
        // const tasks = await Task.find({ _id, owner: req.user._id })
        // res.send(tasks)    
        await req.user.populate({
            path: 'tasks',
            match,
            options
        }).execPopulate()
        res.send(req.user.tasks)    
    } catch (error) {
        res.status(500).send(); // bad connection with database
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    // check if _id is a correct format of ObjectId
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send();
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];

    // validate updates are all allowed
    const areUpdatesAllowed = updates.every(update => allowedUpdates.includes(update))

    if (!areUpdatesAllowed){
        return res.status(500).send({ error: 'Invalid updates!' });
    }

    // check if id is of correct format of ObjectId
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send();
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        // const task = await Task.findById(_id);

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach(update => task[update] = req.body[update])
        await task.save();

        res.send(task)
    } catch (error) {
        res.status(500).send();
    }

})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    // check if _id is a correct format of ObjectId
    if (!mongoose.isValidObjectId(_id)){
        return res.status(400).send({ error: 'Enter a valid ObjectId!'});
    }

    try {
        const taskDeleted = await Task.findOneAndDelete({ _id, owner: req.user._id });

        if (!taskDeleted) {
            return res.status(404).send();
        }

        res.send(taskDeleted)
    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = router
