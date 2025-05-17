import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: '60vh',
  '& .MuiTableCell-root': {
    padding: '12px 16px',
  },
  '& .MuiTableRow-root:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const StyledTableCell = styled(TableCell)(({ theme, align }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[100],
  position: 'sticky',
  top: 0,
  zIndex: 1,
  textAlign: align || 'left'
}));

const TableVisualization = ({ config }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(config.options.pagination.pageSize);
  const [orderBy, setOrderBy] = useState(config.options.sorting.defaultSort.field);
  const [order, setOrder] = useState(config.options.sorting.defaultSort.order);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    const comparator = (a, b) => {
      let valueA = a[orderBy];
      let valueB = b[orderBy];

      // Handle currency string comparison
      if (orderBy === 'amount') {
        valueA = parseFloat(valueA.replace(/[₹,]/g, ''));
        valueB = parseFloat(valueB.replace(/[₹,]/g, ''));
      }

      if (order === 'desc') {
        return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
      }
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    };

    return [...config.data].sort(comparator);
  }, [config.data, order, orderBy]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      <Box p={2}>
        <Typography
          variant="h6"
          component="h2"
          align="center"
          sx={{
            ...config.options.title.style,
            marginBottom: 2
          }}
        >
          {config.options.title.text}
        </Typography>
      </Box>

      <StyledTableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {config.options.columns.map((column) => (
                <StyledTableCell
                  key={column.accessor}
                  align={column.align}
                  style={{ width: column.width }}
                >
                  <TableSortLabel
                    active={orderBy === column.accessor}
                    direction={orderBy === column.accessor ? order : 'asc'}
                    onClick={() => handleSort(column.accessor)}
                  >
                    {column.header}
                  </TableSortLabel>
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index}>
                {config.options.columns.map((column) => (
                  <TableCell
                    key={column.accessor}
                    align={column.align}
                  >
                    {row[column.accessor]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={config.data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TableVisualization; 