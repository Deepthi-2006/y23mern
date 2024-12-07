import express from 'express';
import Section from '../models/Section.js';

const router = express.Router();

// POST route to create a new section
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    const newSection = new Section({
      name,
      description,
    });

    await newSection.save();
    res.status(201).json(newSection);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ message: 'Server error, could not create section' });
  }
});

// GET route to fetch all sections
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find();
    res.status(200).json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error, could not fetch sections' });
  }
});

// GET route to fetch a single section by ID
router.get('/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json(section);
  } catch (error) {
    console.error('Error fetching section by ID:', error);
    res.status(500).json({ message: 'Server error, could not fetch section' });
  }
});

// PUT route to update a section by ID
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Update the section by ID
    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      { name, description },  // fields to update
      { new: true }  // return the updated document
    );

    if (!updatedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Server error, could not update section' });
  }
});

// DELETE route to delete a section by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedSection = await Section.findByIdAndDelete(req.params.id);

    if (!deletedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Server error, could not delete section' });
  }
});

export default router;
