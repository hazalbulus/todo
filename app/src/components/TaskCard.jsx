import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';
import EditIcon from '@mui/icons-material/Edit';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import DeleteIcon from '@mui/icons-material/Delete';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import dayjs from 'dayjs';
import { useDrag } from 'react-dnd';
import { deleteTask, updateTask } from '../api/api';
import DeleteModal from './DeleteModal'; 


export default function TaskCard({ task, onTaskDeleted, onTaskUpdated, moveTask  }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(task.status);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [rank, setRank] = useState(task.rank);
  const [dueDateMessage, setDueDateMessage] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); 


  const [, dragRef] = useDrag({
    type: 'task',
    item: { id: task.id, status: task.status },
  });

  useEffect(() => {
    calculateDueDateMessage();
  }, [dueDate]);

  const handleExpandClick = (event) => {
    event.stopPropagation();
    if (!editing) {
      setExpanded(!expanded);
    }
  };

  const handleEditClick = () => {
    setEditing(!editing);
  };

  const handleSaveUpdateClick = async () => {
    if (editing) {
      try {
        const updatedTask = await updateTask(task.id, {
          name,
          description,
          dueDate,
          rank,
          status,
        });
        onTaskUpdated(updatedTask); // Notify parent component about the update
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
    setEditing(!editing);
  };


  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleRankChange = (event) => {
    setRank(event.target.value);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true); 
  };
  const handleConfirmDelete = () => {
    onTaskDeleted(task.id); 
    setDeleteModalOpen(false); 
  };
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false); // Close the delete modal
  };

  const rankColor = (rank) => {
    switch (rank) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'black';
    }
  };

  const formatDueDate = (date) => {
    return dayjs(date).format('DD MMMM');
  };

  const calculateDueDateMessage = () => {
    const today = dayjs().startOf('day');
    const due = dayjs(dueDate).startOf('day');
    const differenceInDays = due.diff(today, 'day');

    if (differenceInDays < 0) {
      setDueDateMessage(`Past ${Math.abs(differenceInDays)} day(s)`);
    } else if (differenceInDays === 0) {
      setDueDateMessage('Today');
    } else if (differenceInDays === 1) {
      setDueDateMessage('Tomorrow');
    } else if (differenceInDays <= 3) {
      setDueDateMessage(`Last ${differenceInDays} day(s)`);
    } else {
      setDueDateMessage(null); // No chip for more than 3 days
    }
  };
  const formatStatus = (status) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  return (
    <Box
      ref={dragRef} 
      sx={{
        minWidth: 300,
        mb: 2,
        position: 'relative',
        backgroundColor: '#F4F2FF',
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          boxShadow: '2',
          backgroundColor: '#F4F2FF',
          borderRadius: 2,
        }}
      >
        {/* Icon button for expanding/shrinking */}
        <IconButton
          onClick={handleExpandClick}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>

        <CardContent>
          {editing ? (
            <TextField
              fullWidth
              label="Task Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 1 }}
            />
          ) : (
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'black' }}>
              {name}
            </Typography>
          )}

          {editing ? (
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 1 }}
            />
          ) : (
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography sx={{ mb: 1.5, color: '#2B1887' }}>
                Due date: {formatDueDate(dueDate)}
              </Typography>
              {dueDateMessage && status!=="done" &&(
                <Chip
                  label={dueDateMessage}
                  color={dueDateMessage.includes('Past') ? 'error' : 'warning'}
                  sx={{ mb: 1.5 }}
                />
              )}
        
            </Box>
          )}

          {editing ? (
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 1 }}
            />
          ) : (
            <Typography sx={{ mb: 1.5, color: '#2B1887' }}>
              Rank: <span style={{ fontWeight: 'bold', color: rankColor(rank) }}>{rank.toUpperCase()}</span>
            </Typography>
          )}
        </CardContent>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {editing ? (
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select value={status} onChange={handleStatusChange}>
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography sx={{ mb: 1.5, color: '#2B1887' }}>
                Status: {formatStatus(status)}
              </Typography>
            )}
            {editing ? null : (
              <Typography variant="body2" sx={{ color: '#2B1887', mb: 1.5 }}>
                Description: {description}
              </Typography>
            )}
            {editing ? (
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Rank</InputLabel>
                <Select value={rank} onChange={handleRankChange}>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            ) : null}
          </CardContent>
        </Collapse>
        <br/>

        {/* Conditionally render CardActions based on expanded state */}
        {expanded && (
          <CardActions
            sx={{ justifyContent: 'flex-end', position: 'absolute', bottom: 8, right: 8 }}
          >
            {editing ? (
              <IconButton size="small" color="success" onClick={handleSaveUpdateClick}>
                <SaveAsIcon />
              </IconButton>
            ) : (
              <IconButton size="small" color="primary" onClick={handleEditClick}>
                <EditIcon />
              </IconButton>
            )}
            <IconButton size="small" color="error" onClick={handleDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </CardActions>
        )}
      </Card>
      <DeleteModal
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        handleConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
