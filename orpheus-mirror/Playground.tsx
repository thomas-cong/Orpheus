import DelayedRecall from "../orpheus-main/ReyOsterrieth/DelayedRecall";
const Playground = () => {
    return (
        <div className="flex flex-col items-center justify-start min-h-screen default-background">
            <div className="text-2xl text-white mb-2 bg-darkblue min-w-full text-left ">
                Playground
            </div>
            <DelayedRecall trialID="test" onCapture={() => {}} />
        </div>
    );
};

export default Playground;
