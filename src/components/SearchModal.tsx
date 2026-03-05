import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import LinkIcon from '@mui/icons-material/Link';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SendIcon from '@mui/icons-material/Send';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'site' | 'project' | 'manual' | 'building' | 'ticket' | 'quotation';
  title: string;
  subtitle?: string;
  metadata?: string;
  icon: React.ReactNode;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  entities?: SearchResult[];
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you search across your portfolio, answer questions about your buildings, assets, and operations. What would you like to know?',
      timestamp: new Date()
    }
  ]);

  // Mock search results
  const searchResults: SearchResult[] = [
    {
      id: '1',
      type: 'site',
      title: '12 Smith St',
      icon: <BusinessIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: '2',
      type: 'project',
      title: 'ABC123-CARE-001',
      icon: <AssignmentIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: '3',
      type: 'manual',
      title: 'Mechanical',
      subtitle: '12 Smith St • ABC123-CARE-001 • 78% complete • 6 comments',
      icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: '4',
      type: 'manual',
      title: 'Electrical',
      subtitle: '12 Smith St • ABC123-CARE-001 • 78% complete • 6 comments',
      icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
    },
  ];

  const handleSendMessage = () => {
    if (!searchQuery.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: searchQuery,
      timestamp: new Date()
    };

    // Mock AI response with entities
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `I found some information related to "${searchQuery}". Here are the relevant items from your portfolio:`,
      timestamp: new Date(),
      entities: searchResults.slice(0, 2)
    };

    setChatMessages([...chatMessages, userMessage, aiResponse]);
    setSearchQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isAIMode) {
        handleSendMessage();
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 8,
        zIndex: 1500
      }}
    >
      <Paper
        sx={{
          width: '90%',
          maxWidth: 900,
          height: isAIMode ? '80vh' : 'auto',
          maxHeight: isAIMode ? '80vh' : '85vh',
          outline: 'none',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <AnimatePresence mode="wait">
          {!isAIMode ? (
            /* Search Mode */
            <motion.div
              key="search-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Search projects, files, manuals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      sx: {
                        '& fieldset': { border: 'none' },
                        bgcolor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => setIsAIMode(true)}
                    sx={{
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      borderColor: '#e0e0e0',
                      color: 'text.primary'
                    }}
                  >
                    Search with AI
                  </Button>
                  <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* Filter Tabs */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tabs
                    value={selectedTab}
                    onChange={(_, newValue) => setSelectedTab(newValue)}
                    sx={{
                      minHeight: 36,
                      '& .MuiTab-root': {
                        minHeight: 36,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        py: 0.5
                      }
                    }}
                  >
                    <Tab icon={<AssignmentIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Projects" />
                    <Tab icon={<BusinessIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Buildings" />
                    <Tab icon={<FolderIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Files" />
                    <Tab icon={<DescriptionIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Manuals" />
                  </Tabs>
                  <IconButton size="small">
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <Box sx={{ flex: 1 }} />
                  <Button
                    size="small"
                    endIcon={<ExpandMoreIcon />}
                    sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.813rem' }}
                  >
                    Sites
                  </Button>
                  <Button
                    size="small"
                    endIcon={<ExpandMoreIcon />}
                    sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.813rem' }}
                  >
                    Parent
                  </Button>
                  <Button
                    size="small"
                    endIcon={<ExpandMoreIcon />}
                    sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.813rem' }}
                  >
                    Creator
                  </Button>
                  <IconButton size="small">
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Results */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Results
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {searchResults.map((result) => (
                    <Paper
                      key={result.id}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: '#1976d2',
                          bgcolor: '#fafafa'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {result.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                            {result.type}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: result.subtitle ? 0.5 : 0 }}>
                          {result.title}
                        </Typography>
                        {result.subtitle && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {result.subtitle}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <LinkIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <FolderIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#1976d2' }}>
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>

              {/* Footer */}
              <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Type <Box component="span" sx={{ px: 0.5, py: 0.25, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 0.5, fontFamily: 'monospace' }}>
                    /
                  </Box> to view available commands, hit <Box component="span" sx={{ px: 0.5, py: 0.25, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 0.5, fontFamily: 'monospace' }}>
                    tab
                  </Box> on selected items to see additional actions.
                </Typography>
              </Box>
            </motion.div>
          ) : (
            /* AI Chat Mode */
            <motion.div
              key="ai-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {/* AI Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SmartToyOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    AI Search Assistant
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ask me anything about your portfolio
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsAIMode(false)}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Search
                </Button>
                <IconButton onClick={onClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Chat Messages */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#fafafa' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {chatMessages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'flex-start',
                        flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                      }}
                    >
                      {/* Avatar */}
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: message.role === 'assistant' ? '#1976d2' : '#757575',
                          fontSize: '0.875rem'
                        }}
                      >
                        {message.role === 'assistant' ? <SmartToyOutlinedIcon sx={{ fontSize: 18 }} /> : 'M'}
                      </Avatar>

                      {/* Message Content */}
                      <Box sx={{ flex: 1, maxWidth: '75%' }}>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: message.role === 'user' ? '#e3f2fd' : '#fff',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Typography>

                          {/* Entity Cards */}
                          {message.entities && message.entities.length > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {message.entities.map((entity) => (
                                <Paper
                                  key={entity.id}
                                  sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    bgcolor: '#f5f5f5',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      bgcolor: '#e8e8e8'
                                    }
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 1,
                                      bgcolor: '#fff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    {entity.icon}
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                                      {entity.type}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {entity.title}
                                    </Typography>
                                  </Box>
                                  <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                </Paper>
                              ))}
                            </Box>
                          )}
                        </Paper>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Chat Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Ask me anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f5f5f5'
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!searchQuery.trim()}
                    sx={{
                      bgcolor: '#1976d2',
                      color: '#fff',
                      '&:hover': {
                        bgcolor: '#1565c0'
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#e0e0e0',
                        color: '#999'
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                  Press Enter to send • Shift+Enter for new line
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </Modal>
  );
}
