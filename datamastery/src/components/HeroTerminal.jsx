import Terminal from '../registry/eldoraui/terminal';

export default function HeroTerminal(props) {
  const terminalSteps = [
    { text: "\n✓ Loading Python" },
    { text: "\n✓ Loading Pandas" },
    { text: "\n✓ Loading NumPy" },
    { text: "\n✓ Initializing Maya" },
    { text: "\n✓ Notebook Ready", bold: true }
  ];

  return (
    <Terminal
      command="python datamastery.py"
      steps={terminalSteps}
      pulseInterval={80}
      showLocalhost={true}
      hostBarTitle="datamastery.py"
      hostMessage="Sandbox Notebook Initialized!"
      {...props}
    />
  );
}
