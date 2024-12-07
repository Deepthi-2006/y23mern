import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { toast } from "react-toastify";

const SectionManagement = () => {
  const { token } = useContext(AppContext);
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({ name: "", description: "" });
  const [editSection, setEditSection] = useState(null);
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Fetch Sections
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log(sections);
    const fetchSections = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/section", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSections(res.data);
      } catch (err) {
        console.error("Error fetching sections:", err);
      }
    };
  
    fetchSections();
  }, [token, sections]);  // Add sections if necessary for triggering effect
  


  // Add Section
  const addSection = async () => {
    try {
      // Ensure that you're sending the request properly
      const res = await axios.post(
        "http://localhost:5000/api/section",
        newSection,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Logging response data after the request is successful
      console.log(res.data);
  
      // Check if the section name is valid before adding
      if (!newSection.name.trim()) {
        toast.error("Section name is required");
        return;
      }
  
      // Add the new section to the state
      setSections([...sections, res.data]);
      setNewSection({ name: "", description: "" });
      toast.success("Section added successfully");
    } catch (err) {
      // Handle any errors that occur during the request
      const errorMessage = err.response?.data?.msg || "Error adding Section";
      console.error(err);
      toast.error(errorMessage);
    }
  };
  
  // Delete Section
  const handleDeleteClick = (section) => {
    setSelectedSection(section);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/section/${selectedSection._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSections(sections.filter((section) => section._id !== selectedSection._id));
      toast.success("Section deleted successfully");
      handleCloseDialog();
    } catch (err) {
      console.error("Error deleting section:", err);
      toast.error(err.response?.data?.msg || "Error deleting section");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSection(null);
  };

  // Update Section
  const updateSection = async () => {
    if (!editSection?.name.trim()) {
      toast.error("Section name is required");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/section/${editSection._id}`,
        editSection,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSections(
        sections.map((section) =>
          section._id === editSection._id ? res.data : section
        )
      );
      setEditSection(null);
      setOpen(false);
      toast.success("Section updated successfully");
    } catch (err) {
      console.error("Error updating section:", err);
      toast.error(err.response?.data?.msg || "Error updating section");
    }
  };

  // Input Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSection({ ...newSection, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditSection({ ...editSection, [name]: value });
  };

  const handleEditOpen = (section) => {
    setEditSection(section);
    setOpen(true);
  };

  const handleEditClose = () => {
    setEditSection(null);
    setOpen(false);
  };

  return (
    <Container sx={{ marginTop: 5 }}>
      <TextField
        label="Section Name"
        name="name"
        value={newSection.name}
        onChange={handleChange}
        fullWidth
        required
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Description"
        name="description"
        value={newSection.description}
        onChange={handleChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <Button
        onClick={addSection}
        variant="contained"
        color="primary"
        sx={{ marginBottom: 2 }}
      >
        Add Section
      </Button>

      {sections.length > 0 ? (
  <TableContainer component={Paper} sx={{ marginTop: 2 }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Section Name</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Date Created</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sections.map((section) => (
          <TableRow key={section._id}>
            <TableCell>{section.name}</TableCell>
            <TableCell>{section.description}</TableCell>
            <TableCell>{new Date(section.dateCreated).toLocaleString()}</TableCell>
            <TableCell>
              <IconButton color="primary" onClick={() => handleEditOpen(section)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => handleDeleteClick(section)}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
) : (
  <Typography>No sections available.</Typography>
)}


      {/* Edit Modal */}
      <Modal open={open} onClose={handleEditClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography>Edit Section</Typography>
          <TextField
            label="Section Name"
            name="name"
            value={editSection?.name || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={editSection?.description || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <Button onClick={updateSection} variant="contained" color="primary">
            Save
          </Button>
          <Button onClick={handleEditClose} variant="contained" color="secondary">
            Cancel
          </Button>
        </Box>
      </Modal>

      {/* Delete Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Delete Section</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this section?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SectionManagement;
