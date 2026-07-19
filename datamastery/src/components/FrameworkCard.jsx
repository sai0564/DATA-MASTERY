import AnimatedFrameworks from '../registry/eldoraui/animated-frameworks';

export default function FrameworkCard(props) {
  return (
    <AnimatedFrameworks
      cardTitle="Framework Compatibility"
      cardDescription="Built directly above Pyodide browser scripts and Monaco editor compilers."
      {...props}
    />
  );
}
