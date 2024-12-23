import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Section from '../models/Section.js';
import Ebook from '../models/Ebook.js';

const router = express.Router();

// Ensure the user is a librarian
const librarianAuth = (req, res, next) => {
    if (req.user.role !== 'librarian') {
        return res.status(403).json({ msg: 'Access denied' });
    }
    next();
};

// Librarian Dashboard
router.get('/dashboard', auth, librarianAuth, async (req, res) => {
    try {
        const usersCount = await User.countDocuments({ role: 'user' });
        const sections = await Section.countDocuments();
        const ebooks = await Ebook.countDocuments();

        const users = await User.find({}, 'username email role');

        const totalBooksIssued = await User.aggregate([
            { $unwind: "$issuedBooks" },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        const stats = {
            usersCount,
            sections,
            ebooks,
            users,
            totalBooksIssued: totalBooksIssued[0]?.count || 0 
        };

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete a user
router.delete('/user/:id', auth, librarianAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const authenticatedUserId = req.user.id;

        if (userId === authenticatedUserId) {
            return res.status(403).json({ msg: 'You cannot delete your own account' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.issuedBooks.length > 0) {
            return res.status(400).json({ msg: 'User has ebooks issued' });
        }

        await User.findByIdAndDelete(userId);
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Section Management
router.post('/sections', auth, librarianAuth, async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }
    try {
        let existingSection = await Section.findOne({ name });
        if (existingSection) {
            return res.status(400).json({ msg: 'Section already exists' });
        }

        let section = new Section({
            name,
            description
        });

        await section.save();
        res.json(section);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/sections/:id', auth, librarianAuth, async (req, res) => {
    const { name, description } = req.body;
    try {
        let section = await Section.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ msg: 'Section not found' });
        }
        section.name = name || section.name;
        section.description = description || section.description;
        await section.save();
        res.json(section);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/sections/:id', auth, librarianAuth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid section ID' });
        }

        const section = await Section.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ msg: 'Section not found' });
        }

        const relatedEbooks = await Ebook.find({ section: req.params.id });
        if (relatedEbooks.length > 0) {
            return res.status(400).json({ msg: 'Section has related ebooks' });
        }

        await Section.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Section removed' });
    } catch (err) {
        console.error('Error deleting section:', err.message);
        res.status(500).send('Server error');
    }
});

// E-book Management
router.post('/ebooks', auth, librarianAuth, async (req, res) => {
    const { name, content, authors, section } = req.body;
    if (!name || !content || !authors || !section) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }
    try {
        let sectionExists = await Section.findById(section);
        if (!sectionExists) {
            return res.status(400).json({ msg: 'Section does not exist' });
        }

        let ebookExists = await Ebook.findOne({ name });
        if (ebookExists) {
            return res.status(400).json({ msg: 'An e-book with the same name already exists' });
        }

        let ebook = new Ebook({
            name,
            content,
            authors,
            section
        });

        await ebook.save();
        res.json(ebook);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/ebooks/:id', auth, librarianAuth, async (req, res) => {
    const { name, content, authors, section } = req.body;
    try {
        let ebook = await Ebook.findById(req.params.id);
        if (!ebook) {
            return res.status(404).json({ msg: 'Ebook not found' });
        }
        if (section) {
            let sectionExists = await Section.findById(section);
            if (!sectionExists) {
                return res.status(400).json({ msg: 'Section does not exist' });
            }
        }

        ebook.name = name || ebook.name;
        ebook.content = content || ebook.content;
        ebook.authors = authors || ebook.authors;
        ebook.section = section || ebook.section;
        await ebook.save();
        res.json(ebook);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/ebooks/:id', auth, librarianAuth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid ebook ID' });
        }

        const ebook = await Ebook.findById(req.params.id);
        if (!ebook) {
            return res.status(404).json({ msg: 'Ebook not found' });
        }

        if (ebook.issuedTo) {
            return res.status(400).json({ msg: 'Ebook is granted to a user' });
        }

        await Ebook.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Ebook removed' });
    } catch (err) {
        console.error('Error deleting ebook:', err.message);
        res.status(500).send('Server error');
    }
});

// Request Management
router.get('/requests', auth, librarianAuth, async (req, res) => {
    try {
        const users = await User.find({ 'requestedBooks.0': { $exists: true } })
            .populate('requestedBooks.ebook')
            .select('username requestedBooks');

        const requests = [];
        users.forEach(user => {
            user.requestedBooks.forEach(request => {
                requests.push({
                    _id: request._id,
                    username: user.username,
                    ebook: request.ebook,
                    status: request.status,
                    dateIssued: request.status === 'granted' ? request.ebook.dateIssued : null,
                    returnDate: request.status === 'granted' ? request.ebook.returnDate : null
                });
            });
        });

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update request status
router.put('/requests/:id', auth, librarianAuth, async (req, res) => {
    const { status } = req.body;
    try {
        const user = await User.findOne({ 'requestedBooks._id': req.params.id });
        if (!user) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        const request = user.requestedBooks.id(req.params.id);
        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (status === 'granted') {
            const ebook = await Ebook.findById(request.ebook);
            if (!ebook) {
                return res.status(404).json({ msg: 'E-book not found' });
            }

            if (ebook.issuedTo && ebook.issuedTo.toString() !== user._id.toString()) {
                return res.status(400).json({ msg: 'E-book already assigned to another user' });
            }

            ebook.issuedTo = user._id;
            ebook.dateIssued = new Date();
            ebook.returnDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
            await ebook.save();

            user.issuedBooks.push({ ebook: ebook._id, dateIssued: ebook.dateIssued });
        }

        request.status = status;
        await user.save();
        res.json({ msg: 'Request status updated', request });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Export the router for use in your server
export default router;