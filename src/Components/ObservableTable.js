import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';



import { map, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import ObservableList from './ObservableList';
import TablePaginationActions from './TablePaginationActions';


const styles = theme => ({
    root: {
      width: '100%',
      marginTop: theme.spacing.unit * 3,
    },
    table: {
    },
    tableWrapper: {
      overflowX: 'scroll',
      "-webkit-overflow-scrolling": "touch"
    },
  });

const ObservableTable = withStyles(styles)(props =>{ 

    var page = (props.page || new BehaviorSubject(0));
    var rowsPerPage = (props.rowsPerPage || new BehaviorSubject(10));
  
    var emptyRows = React.useMemo(() =>combineLatest(props.list,rowsPerPage).pipe(map(([list,rowsPerPage]) =>{
      if (rowsPerPage == 0) return 0;
      return rowsPerPage - list.length;
    })),[props.list, rowsPerPage]);
  
    return (
      <Paper className={props.classes.root}>
        <div className={props.classes.tableWrapper}>
          <Table className={props.classes.table}>
            <TableHead>
              <TableRow>
                {props.headers}
              </TableRow>
            </TableHead>
            <TableBody>
              <ObservableList value={props.list} rowComponent={props.rowComponent} />
              <ObservableTableEmptyRows emptyRows={emptyRows} />
            </TableBody>
          </Table>
        </div>
        <ObservablePagination count={props.count} page={page} rowsPerPage={rowsPerPage}/>
      </Paper>
    )
  })
  
  
  const ObservableTableEmptyRows = props =>{
    const [emptyRows, setEmptyRows] = React.useState(0);
    const [colSpan, setColSpan] = React.useState(3);
    
    var style = React.useMemo(() =>({ height: 48 * emptyRows}),[emptyRows]);
    
  
    React.useEffect(() => {
      const subscription = props.emptyRows.pipe(
        distinctUntilChanged((prev, curr) => prev == curr)
      ).subscribe((emptyRows) =>{
        setEmptyRows(emptyRows)});
      return () =>subscription.unsubscribe();
    }, []); 
  
    if (emptyRows == 0) return <React.Fragment />
    return(
        <TableRow style={style}>
          <TableCell colSpan={colSpan} />
        </TableRow>
    )
  }
  
  const ObservablePagination = React.memo(props =>{
  
    const [count, setCount] = React.useState(0);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
  
    React.useEffect(() => {
      const subscription = props.count.pipe(
        distinctUntilChanged((prev, curr) => prev == curr)
      ).subscribe((count) =>{
        setCount(count)});
      return () =>subscription.unsubscribe();
    }, []); 
  
  
    React.useEffect(() => {
      const subscription = props.page.pipe(
        distinctUntilChanged((prev, curr) => prev == curr)
      ).subscribe((page) =>setPage(page));
      return () =>subscription.unsubscribe();
    }, []); 
  
    React.useEffect(() => {
      const subscription = props.rowsPerPage.pipe(
        distinctUntilChanged((prev, curr) => prev == curr)
      ).subscribe((rowsPerPage) =>setRowsPerPage(rowsPerPage));
      return () =>subscription.unsubscribe();
    }, []); 
  
    if (rowsPerPage == 0) return (<React.Fragment/> );
  
    return(
      <TablePagination
          labelRowsPerPage=""
          rowsPerPageOptions={[10,20,40,50]}
          colSpan={3}
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          SelectProps={{
            native: true,
          }}
          onChangePage={(event, page) => props.page.next(page)}
          onChangeRowsPerPage={e  => props.rowsPerPage.next(parseInt(e.target.value))}
          ActionsComponent={TablePaginationActions}
        />
    )
  })
  
  

  export default ObservableTable;