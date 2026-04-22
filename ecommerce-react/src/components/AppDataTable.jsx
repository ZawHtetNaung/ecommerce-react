import DataTable from 'react-data-table-component';

const paginationComponentOptions = {
  rowsPerPageText: 'Rows',
  rangeSeparatorText: 'of',
};

export default function AppDataTable({ columns, data, progressPending = false, onRowClicked = undefined }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      progressPending={progressPending}
      onRowClicked={onRowClicked}
      pagination
      paginationComponentOptions={paginationComponentOptions}
      highlightOnHover
      pointerOnHover
      striped
      dense
      responsive
      persistTableHead
    />
  );
}
