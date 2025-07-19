import { SourceCodeSnippet } from '../../components/mdx/SourceCodeSnippet';
import Example from './sandbox/src/TS';
const TS = require('!!raw-loader!./sandbox/src/TS.tsx').default;

const ExampleTable = ({ showTopRow = true }) => {
  return (
    <SourceCodeSnippet
      Component={Example}
      typeScriptCode={TS}
      tableId="aggregation-and-grouping"
      showTopRow={showTopRow}
    />
  );
};

export default ExampleTable;
