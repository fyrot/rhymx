import { toast } from "sonner";
export interface ToastData {
    id: string | number;
    title: string;
    description: string;
    background: string | undefined;
}
export function queueToast(toastInfo: Omit<ToastData, 'id'>) {
    return toast.custom((id) => (
        <QueueToast id={id} title={toastInfo.title} description={toastInfo.description} background={toastInfo.background} />
    ), {duration: 2000})
}
function QueueToast(props: ToastData) {
    return (
        <div className="flex rounded-2xl shadow-lg w-full min-w-96 md:max-w-xl items-center p-4" style={{background: props.background ? props.background : "#171717"}}>
            <div className="flex flex-col w-full">
                <h1 className="text-white text-sm font-semibold">{props.title}</h1>
                <p className="text-neutral-100 text-sm font-normal">{props.description}</p>
            </div>
            
        </div>
    )
}