import { createMemo, createSignal, onCleanup } from "solid-js";
// Import worker with ?worker
import PrimeWorker from "./prime.worker?worker";
import { createStore } from "solid-js/store";
import "./App.css";

type WorkerMessage = {
  result: number | null;
  progress?: number;
};

function App() {
  const [lastWorkerMessage, setLastWorkerMessage] = createStore<WorkerMessage>({
    result: null,
  });
  const [worker, setWorker] = createSignal<Worker | null>(null);
  const [limit, setLimit] = createSignal(20000000);
  const [reportIncrements, setReportIncrements] = createSignal(20);

  const initWorker = () => {
    const worker = new PrimeWorker();

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      setLastWorkerMessage(e.data);
      // Re-initialize worker on completion
      if (e.data.progress === 100) {
        worker.terminate();
        setWorker(initWorker());
      }
    };

    return worker;
  };

  // Initialize the worker
  setWorker(initWorker());

  const running = createMemo(
    () =>
      lastWorkerMessage.progress !== undefined &&
      lastWorkerMessage.progress < 100,
  );

  const hasResults = createMemo(() => lastWorkerMessage.result !== null);

  const runCalculation = () => {
    const currentWorker = worker();
    if (currentWorker === null) {
      return;
    }
    setLastWorkerMessage({ result: null, progress: 0 });
    currentWorker.postMessage({
      limit: limit(),
      reportIncrements: reportIncrements(),
    });
  };

  const cancelCalculation = () => {
    setLastWorkerMessage({ result: null, progress: undefined });
    worker()?.terminate();
    setWorker(initWorker());
  };

  onCleanup(() => {
    worker()?.terminate();
  });

  return (
    <div class="app-container">
      <h3>Prime Counter</h3>
      <fieldset class="controls">
        <legend>Web worker reporting frequency:</legend>
        <input
          id="reportIncrements"
          disabled={running()}
          type="range"
          value={reportIncrements()}
          onInput={(e) => setReportIncrements(parseInt(e.target.value) || 20)}
          min="1"
          max="100"
        />
        <input
          id="reportIncrements2"
          disabled={running()}
          type="number"
          value={reportIncrements()}
          onInput={(e) => setReportIncrements(parseInt(e.target.value) || 20)}
          min="1"
          max="100"
        />
      </fieldset>
      <div class="controls">
        <button onClick={runCalculation} disabled={!worker() || running()}>
          {running() ? "Counting primes" : "Count primes"}
        </button>
        <label for="limit">less than or equal to</label>
        <input
          id="limit"
          disabled={running()}
          type="number"
          value={limit()}
          onInput={(e) => setLimit(parseInt(e.target.value) || 20000000)}
          min="1"
        />
        <button onClick={cancelCalculation} disabled={!running()}>
          Cancel
        </button>
      </div>
      <div class={`results ${hasResults() ? "visible" : ""}`}>
        <p>Primes found: {lastWorkerMessage.result}</p>
        <p class={`progress-text ${running() ? "visible" : ""}`}>
          {lastWorkerMessage.progress}% done
        </p>
      </div>
      <div class={`progress-container ${running() ? "visible" : ""}`}>
        <div
          class="progress-bar"
          style={{
            width: `${lastWorkerMessage.progress || 0}%`,
          }}
        />
      </div>
    </div>
  );
}
export default App;
