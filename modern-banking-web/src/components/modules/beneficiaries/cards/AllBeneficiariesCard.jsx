import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  IconButton, 
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const BeneficiariesCard = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const SearchBar = styled(FlexBox)`
  margin: 1.5rem 0;
  gap: 1rem;
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    background: ${props => props.theme.palette.background.paper};
    transition: ${props => props.theme.transitions.quick};

    &:hover {
      background: ${props => props.theme.palette.grey[50]};
    }

    &.Mui-focused {
      background: ${props => props.theme.palette.grey[50]};
    }
  }
`;

const BeneficiariesList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.palette.background.default};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.palette.grey[300]};
    border-radius: ${props => props.theme.shape.borderRadius}px;
  }
`;

const BeneficiaryItem = styled(FlexBox)`
  padding: 1rem;
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    background: ${props => props.theme.palette.grey[50]};
  }
`;

const BankName = styled(Typography)`
  color: ${props => props.theme.palette.primary.main};
  font-size: 0.875rem;
  font-weight: 500;
`;

const AllBeneficiariesCard = ({
  beneficiaries = [],
  onSearch,
  onFilter,
  onTransfer,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    if (onFilter) {
      onFilter(filter);
    }
    handleFilterClose();
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleMenuOpen = (beneficiary, event) => {
    setSelectedBeneficiary(beneficiary);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBeneficiary(null);
  };

  const handleTransfer = () => {
    if (onTransfer && selectedBeneficiary) {
      onTransfer(selectedBeneficiary);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (onEdit && selectedBeneficiary) {
      onEdit(selectedBeneficiary);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete && selectedBeneficiary) {
      onDelete(selectedBeneficiary);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <BeneficiariesCard>
      <FlexBox justify="space-between" align="center">
        <FlexBox gap="1rem">
          <CircleIcon>
            <PeopleIcon />
          </CircleIcon>
          <div>
            <Typography variant="h6">Your Beneficiaries</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your saved beneficiaries
            </Typography>
          </div>
        </FlexBox>
        <Tooltip title="Filter Beneficiaries">
          <IconButton onClick={handleFilterClick}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && !selectedBeneficiary}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleFilterSelect('all')}>
            All Beneficiaries
          </MenuItem>
          <MenuItem onClick={() => handleFilterSelect('recent')}>
            Recently Added
          </MenuItem>
          <MenuItem onClick={() => handleFilterSelect('frequent')}>
            Frequently Used
          </MenuItem>
        </Menu>
      </FlexBox>

      <SearchBar>
        <StyledTextField
          fullWidth
          placeholder="Search beneficiaries..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </SearchBar>

      <BeneficiariesList>
        {beneficiaries.map((beneficiary) => (
          <BeneficiaryItem key={beneficiary.id} justify="space-between" align="center">
            <FlexBox gap="1rem" flex={1}>
              <CircleIcon size="32px">
                <PeopleIcon fontSize="small" />
              </CircleIcon>
              <div>
                <Typography variant="body1" fontWeight="500">
                  {beneficiary.name}
                </Typography>
                <BankName>
                  {beneficiary.bankName}
                </BankName>
                <Typography variant="body2" color="text.secondary">
                  Account: {beneficiary.accountNumber}
                </Typography>
              </div>
            </FlexBox>
            
            <IconButton 
              onClick={(e) => handleMenuOpen(beneficiary, e)}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          </BeneficiaryItem>
        ))}
      </BeneficiariesList>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && Boolean(selectedBeneficiary)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleTransfer}>
          <SendIcon fontSize="small" sx={{ mr: 1 }} />
          Quick Transfer
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Details
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Delete Beneficiary
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedBeneficiary?.name} from your beneficiaries list?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </BeneficiariesCard>
  );
};

export default AllBeneficiariesCard; 