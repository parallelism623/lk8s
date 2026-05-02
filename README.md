# K8s

## 📌 Overview
- K8s giúp dev deploy app tự động, phân bổ và quản lí server, scheduling deploy, self-healing từ failures, tự scale.  
- Bằng cách trừu tượng hóa phần cứng như một nền tảng để triển khai app, cho phép user deploy app bằng cách khai báo resource cần thiết thông quan các yaml/json file. Cluster chịu trách nhiệm quản lí và phân bộ tài nguyên phần cứng theo yêu cầu.
- K8s sử dụng tính năng của Linux container, linux namespace, cgroups để cho phép các application trên cùng cụm hoặc cùng node chạy độc lập với các app khác như chúng đang được deploy trên các app khác.
- Container là các lightweight isolate process chạy trực tiếp trên host OS (dựa trên một container platform), cho phép triển khai các app trên chúng. Để container isolate với các container khác cần:
  - Linux namespace: trong linux có các namespace gán cho process, là thứ quyết đinh các process khác nhau. Linux cho phép tạo ra các namespace khác nhau  → có thể isolate các container process
  - Linux cgroups features: Giới hạn resource một process khác có thể sử dụng Container phù hợp cho só lượng process cần chạy lớn, trong khi mỗi process vừa phải. Giúp hạn chế các overhead khi dùng VMs như : process requires, booting, sys call thực hiện nhiều phase. 
    
- Docker container platform là công cụ cho phép “packaging, distributing và running application” nhờ:
    - Docker images: Docker-based container images là nơi define cách application được đóng gói, install các dependencies cần thiết, config một số ENV variables.
    - Docker register: Repositories lưu các docker images cho phép sharing docker images.
    - Docker container: A docker-based container là các linux container. Một running container là một process chạy trong host running Docker.
Core concepts: 

- Hệ thống k8s gồm một master node và các worker nodes.
- Một cluster gồm: Control plane (master node) và nhiều worker nodes.
- Các app phụ thuộc nhau có thể deploy trên cùng một worker nodes, trong khi các cái khác có thể phân bộ trên toàn cluster.

**Kubernetes Cluster Architecture:**

- Master node: host Kubernetes Control Plane - quản lí toàn bộ hệ thống kubernetes
- Worker nodes: run application mà cta deploy
    
    ![image.png](/images/worker-node-img.png)
    

***The control plane:*** 

Kiểm soát cluster và thực hiện các function.

- Kubernetes API Server: nơi user và các component khác của Control Plane components kết nối với nhau.
- Scheduler: Schedules deploy app.
- Controller Manager: thực hiện các cluster-level function như: replicating components, theo dõi các worker nodes, và handling node failures.
- etcd: lưu trữ các configuration cho cluster.

***The worker nodes:***

Running, monitoring và cung cấp service để chạy app bởi các components sau: 

- Container runtime: Là container platform như docker, rkt, cho phép chạy các containers.
- Kubelet nói chuyện với API server và quản lí các pod/container trên nodes mà nó quản lí.
- kube-proxy: cân bằng network traffic giữa các application components.

***Deploy an application in K8s***

Khi deploy một application lên k8s, user cần cung cấp description chứa các thông tin: 

- Container images identify
- Các container cần run cùng vị trí hoặc khác vị trí.
- Số lượng replicas…

K8s sẽ:

- Hỗ trợ running container đúng theo mô tả
- Automatically scaling up/down in/out
- Hỗ trợ static IP và DNS.

![image.png](/images/deploy-app-flow.png)

***Benefits of using K8s***

- Simplifying deployment
- Auto scaling
- Utilization of hardware
- Health checking and self-healing


<details>
<summary>Define</summary>

How an image in docker is built?

![image.png](/images/build-push-pull-docker-image.png)

Contents của toàn bộ docker context được upload lên docker daemon và image được built ở đây. Docker build context folder được chỉ định trong lệnh build sau tag của image. Mỗi image là một stack các layer, các layer base image đã tồn tại trên docker deamon sẽ k cần pull lại. 

```jsx
kubectl: cli cho phep tuong tac voi k8s control plane thong qua API server
kubectl get nodes: get nodes of the cluster
kubectl describe node [node_name]: mo ta detail 1 node
kubectl get pods: get list of pods
kubectl get services: get list of services in k8s
kubectl run [type-controler: optional] [name] --images= --port= : chay mot controller/pod tuong ung
kubectl expose [type] [name] --type=[serviceType] --port=[servicePort]
kubectl scale [controller] [name] --replicas=[int]: scaling
```

pod: pod trong k8s là nơi tập hợp một số containers chạy trên cùng namespaces.

- mỗi pod sẽ có ip riêng (unique trong cluster) cho phép các pods giao tiếp với nhau bất kể cùng hay khác nodes.

services: services trong k8s tạo ra nhằm giải quyết vấn đề các pods/containers có thể thay đổi IP address liên tục. services expose một static IP, duy trì suốt lifetime của nó, cho phép client kết nối. bản thân services sẽ chịu trách nhiệm routing request từ client tới một trong các pods mà nó được gán.

</details>

<details>
<summary>Pods</summary>

***Define***

Pods là logical hosts chứa các process được đóng gói trong các containers. Các container trong pods là partial isolated. Chúng sẽ thuộc về một số namespace chung như PIC, Network, UTS… Tuy nhiên mỗi container sở hữu một filesystem namespace riêng. Vì vậy giúp tổ chức các components khá liên quan nhau cùng một vị trí. đồng thời vẫn giữ được một số tính chất của container.

Sử dụng nhiều container trong một pods thay vì sử dụng nhiều process trong container. Vì container mục đích sinh ra để chạy một main process với các process phụ được sinh ra từ main chứ k hướng tới multiple process độc lập, khi đó user phải manual quản lí các usecase như tiến trình crash không được ảnh hưởng tiến trình khác, phân chia filesystem…

Pods trong một cluster nằm trên FLAT INTER-POD NETWORK vì vậy chúng có thể dễ dàng kết nối với nhau thông qua IP mà không cần thông qua NAT hay một thành phần trung gian khác.

***When should we use MULTIPLE CONTAINERS IN A POD?*** 

Phần lớn các usecase → single container pod

Tuy nhiên để quyết định nên dùng single/multiple container pod dựa trên các câu hỏi:

- Các componenet độc lập hay đại diện cho một services
- Các components cần run tại cùng vị trí hay khác host
- Scale cùng nhau hay độc lập.

***Define a pod YAML***

- apiVersion
- kind: loại tài nguyên
- metadata: gồm tên, namespace, labels, và các thông tin khác về pod
- spec: chứa mô tả về pod’contents như pod container, volumne và other data. Port trong spec chỉ mang tính chất mô tả.
- status: mô tả trạng thái của pod đang chạy bao gồm: condition, status of each container, pod’s internal IP.

```jsx
kubectl get pod [name] -o yaml/json: in ra YAML/Json definition cua pod
kubectl explain pods: in ra mo ta cac thanh phan cua YAML/JSON pod
kubectl create -f define.yml: tao pod dua tren yaml file
kubectl logs [nameOfPod]: xem log cuar pod tuong ung.

```

**Port forwarding:** Mở một network tunnel từ local machine tới pod, cho phép kết nối tới pod mà không cần thông qua một service nào. 

 

![image.png](/images/port-forwarding.png)

***Pod Label***

Pod label cho phép group các pods theo label tùy ý với mục đích dễ quản lí, dễ hiểu (thông qua label biết mục đích của group). Một pod được phép có nhiều labels miễn là keys không trùng nhau. 

Label được define trong metadata.labels: KeyValuePairs

```jsx
kubectl get [resource] --show-labels: get resource + them column label
kubectl label [resource] [resourceName] key=value
	[--overwrite=ghi de neu ton tai]
```

Khi resource đã được gán label, thì có thể sử dụng label selector để filter các resource dựa trên các tiêu chí:

- Resource chứa label (hoặc không chứa) với key cụ thể không?
- Resource chứa label có key và value cụ thể không?
- Resource chứa label có key và giá trị không phải value cung cấp không?

```jsx
kubectl get [resource] -l key=value: filter resource dua tren label
#Cac condition sau -l co the seperate boi dau phay, pod phai thoa man tat ca condition.
#Ngoai key=value, con co the su dung: key in/notin (value1, value2...)
```

Labels selectors được sử dụng cho các action thực hiện trên list pods thỏa mãn. 

**Using label selector to constraint pod scheduling**

Trong khai báo yaml/json pod thì có teher chỉ định nodeSelector hoặc các resource selector khác, thông báo cho schedule deploy pod trên node thỏa mãn điều kiện selector.

***Namespace***

Namespace cho phép chia các resource thành các group khác nhau (không overlap như labels) cho phép: 

- tổ chức resource
- grouping
- filtering
- apply policy (RBAC, quota…)

Tuy nhiên namespace không cung cấp các kind of isolating resouces. Khi làm việc với kubectl, namespace của k8s context là default. Vì vậy khi cần thao tác các resource thuộc namespace khác cần phải —namespace cụ thể.

***Deleting pods***

Delete pods sẽ khiến các container phải dừng. Đâu tiên lệnh SIGTERM được sử dụng nhằm mục đích stop gracefully các container (30s theo default) sau đó với các container chưa dừng SIGKILL sẽ được sử dụng.

```jsx
kubectl delete pod [podName]: xoa pod theo ten
kubectl delete po -l labelKey=labelName: xoa pod theo label
kubectl delete ns namespaceName: xoa namespace voi cac resource cua no
kubectl delete po --all: xoa pod cua current namespace (-n neu muon namespace cu the)

```

</details>

<details>
<summary>Controllers</summary>

Pod Health & Restart

Trong Kubernetes, container sẽ được restart khi **main process (PID 1) bị crash**, tùy theo `restartPolicy`:

- `Always` (default)
- `OnFailure`
- `Never`

👉 Nếu app bị lỗi nhưng **không làm crash process** → container **không restart**  
→ cần cơ chế kiểm tra health riêng.

---
Liveness Probe

Dùng để kiểm tra container còn "sống" hay không. Nếu fail → container bị restart.

Các loại probe:

- HTTP GET
- TCP Socket
- Exec command trong container

HTTP probe

```yaml
spec:
  containers:
  - name: app
    image: my-app
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
```
Để giữ cho probe effective: 

- Check các internal component của bản thân app mà probe đang kiểm tra, thường thông qua các specific URL: /health.
- Probe nên light weight
- Không nên chứa loop**

### Controllers

***Replication Controller***

Replication controller trong k8s là resources cho phép quản lí và giữ cho số lượng pods running đúng với giá trị mong muốn được định nghĩa khi khởi tạo, có thể modified.

Replication controller gồm ba thành phần: 

- pod template: cấu trúc như khi tạo pod yaml file
- replicas: số lượng pods running cần duy trì
- label selector: để biết pod nào đang trong scoped quản lí của controller.

Controller sẽ duy trì một vòng loop: 

![image.png](/images/replication-controller-flow.png)

Với mỗi vòng lặp controller sẽ query trạng thái các pod theo label selector thông qua API server từ đó quyết định xem nên thêm/xóa số lượng pod để giữ cho số lượng pod running đúng theo yêu cầu. 

Update Controller Label Selector

Khi update controller label thì các pod hiện tại sẽ không còn chịu sự quản lí của controller nữa, khi thực hiện query các pod theo label selector, controller sẽ thấy số lượng không đủ, buộc nó phải tạo mới các pods.

User cũng có thể update pod label, khi label trong pod không còn trùng khớp với label của controller, pod sẽ move out khỏi scoped quản lí của controller → controller phải tạo mới pods instance, tương tự khi một pods được gán label trùng với label của controller → controller phải xóa bớt pods instance.

Update Controller Pod Template

Khi update pod template các pod hiện tại không bị ảnh hưởng thay vào đó ở các lần tạo mới pod instance kế tiếp updated pod template sẽ được sử dụng.

```jsx
kubectl edit deployment.apps : edit controller yaml file.
```

Update Controller Replicas

```jsx
kubectl scale deployment.apps [name] --replicas=[int]: thay doi so running pod mong muon
```

Delete Controller

Xóa một controller sẽ xóa các pods mà nó quản lí, để giữ các pods không bị xóa có thể sử dụng

```jsx
$ kubectl delete rc kubia --cascade=false
```

***Replica Set***

Là bản nâng cấp của controller replication, cho phép label selector match theo expression để kiểm tra xem:

- Pod labels có chứa key có values nằm trong một list hay không nằm trong một list values hay không
- Pod labels có chứa key hay không.

```jsx
# De khai bao label selector expression
spec.selector:
matchExpressions:
	- key
	- operator: In/NotIn/Exists/DoesNotExist
	- values
```

***Daemon Sets***

Deploy mỗi node một pod, bất kể node đó là unreachable. Tuy nhiên bằng nodeSelectors được define trong pod template, có force deamon set chỉ deploy pod lên các node có selector cụ thể. 

Các pods được deploy bằng deamon set thường thực hiện các system-level functionality và không thông qua Scheduler vì vậy mà attribute unreachable của node không áp dụng với deamons set.

***Job Contronller***

Cho phép deploy các pods chạy một lần và complete. Các pods cần chạy bằng với giá trị config spec.completions, mỗi lần có thể tạo số lượng pods chạy song song dựa vào spec.parallelism, trong quá trình pods thực hiện task nếu node deploy pod bị fail thì controller sẽ schedule pod đó trên node khác, trường hợp pod fail thì dựa vào restart policy để quyết định nên restart lại pod đó hay không.

```yaml
apiVersion: batch/v1
kind: Job
metadata: 
  name: batch-job
spec:
  template:
    metadata:
      labels:
        app: batch-job
    spec:
      restartPolicy: OnFailure
      containers:
      - name: main
        image: luksa/batch-job
```

***CronJob Controller***

Cho phép deploy Job dựa trên Job template theo định kì dựa trên scheduler pattern. Job sau đó sẽ chạy các Pods được config trong template, thực hiện các task.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: batch-job-every-fifteen-minutes
spec:
  schedule: "0,15,30,45 * * * *"
  jobTemplate: 
    spec:
      template:
        metadata:
          labels:
            app: periodic-batch-job
        spec:
          restartPolicy: OnFailure
          containers:
          - name: main
            image: luksa/batch-job
```

</details>

<details>
<summary>Services</summary>

Define: Services backed các pods cung cấp chung một app services bằng label selectors. Đóng vai trò là một cổng đầu vào duy nhất của các connection có đích đến là app services đó. Giải quyết được vấn đề các pods có thể nâng lên hạ xuống khiến IP không cố định.

![image.png](/images/services-flow-overview.png)

Một số services có ClusterIP là virtual IP cho phép truy cập nội bộ trong cluster.

Ngoài truy cập thông qua clusterIP k8s có một internal DNS server cho phép các pods truy cập thông qua FDNS có format: service-name.namespace.suffix.

***Expose an External Services***

Services không link trực tiếp đến pods như flow trên mà giữa chúng có một Endpoints resource. Điều này cho phép tách rời Services với Service Endpoints, giúp quản lí và cập nhật dễ hơn. 

Dựa vào Service Endpoints yaml file có thể define các external ip cho phép các pods truy cập tới các external resource. Endpoints yaml define yêu cầu phải có name trùng với name của Service và list port phải match. 

Khi thay đổi label selector trong svc (thông qua edit command). List endpoints sẽ được update lại tuy nhiên khi xóa labels selector thì list endpoints giữ nguyên.

Ngoài define external service trong Endpoints file có thể define một ExternalName services. CNAME DNS sẽ được CoreDNS tạo ra cho service đó. CNAME DNS là một DNS trả về Domain khác thay vì IP như Record DNS. Tức một FDNS internal sẽ được tạo ra cho các pods trong cluster và khi một pods consume FDNS đó thì nó sẽ được redirectly sang DNS gốc thay vì thông qua kube-proxy.

```jsx
apiVersion: v1
kind: Service
spec:
	type: ExternalName
	externalName: [domain]
```

***Expose Services For External Clients***

**NodePort**

Mở một port trên tất cả các node. Khi truy cập tới node thông qua IP và port được define, connection sẽ được redirect tới service, sau đó pods match với selector sẽ được chọn và connection được điều hướng tới pods. 

```jsx
apiVersion:
kind: Service
spec: 
	type: NodePort
	ports:
	- port: 
		targetPort:
		nodePort: // Chi dinh port can mo tren cac node.
```

**LoadBalancer**

Là extension của NodePort, thường được hỗ trợ bởi các cloud provider. LoadBalancer service sẽ cung cấp một unique external IP và port cho phép client bên ngoài cluster có thể truy cập được tới nó. Sau khi connection tới LoadBalancer nó sẽ dựa vào node port do nó chọn trong quá trình khởi tạo, luồng thực thi sau đó giống với NodePort.

```jsx
apiVersion:
kind: Service
spec: 
	type: LoadBalancer
	ports:
	- port: 
		targetPort:
		nodePort: // Chi dinh port can mo tren cac node.
```

Connection sau khi tới services nó lại chọn pods ngẫu nhiên → Có thể xảy ra network hops tức connection tới node A sau đó tới services nhưng services lại chọn pods trên Node B. Sử dụng externalTrafficPolicy: local để nói service chỉ chọn pods trên node điều hướng connection tới service đó. Tuy nhiên nếu node k có pod tương ứng, connection sẽ bị treo. 

```jsx
// Su dung externalTrafficPolicy: local 
spec:
	externalTrafficPolicy: local
```

Với network hops, SNAT(source network address translation) xảy ra làm mất clientIP, externalTrafficPolicy giúp đảm bảo clientIp.

**Ingress** 

Ingress là resource cho phép đóng vai trò là đầu vào của nhiều loại services được config theo các rule cụ thể. Ingress sẽ sử dụng tên services được khai báo trong rules và port tương ứng để nó có thể query trên Endpoints resource của services đó lấy ra pods tướng ứng thay vì gửi connection tới services và để servies redirect connection tới pods. 

![image.png](/images/ingress-flow.png)

```jsx
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: kubia
spec:
  rules:
  - host: kubia.example.com             
    http:
      paths:
      - path: /                           
        backend:
          serviceName: kubia-nodeport     
          servicePort: 80       
     tls:
         
```

***Readiness Probes***

Readiness probes là probes sẽ kiểm tra định kì xem pods sẵn sàng phản hồi request từ client hay chưa. 

Readiness probes có 3 loại giống liveness probes: exec, tcp, http

Nếu một pods fail khi thực hiện readiness check thì nó sẽ bị remove ra khỏi Endpoint resources vì vậy các request sẽ khong được điều hướng

tới các pods đó nữa.

![image.png](/images/readiness-flow.png)

```jsx
apiVersion: v1
kind: ReplicationController
...
spec:
  ...
  template:
    ...
    spec:
      containers:
      - name: kubia
        image: luksa/kubia
readinessProbe:       
          exec:               
            command:          
            - ls              
            - /var/ready
```

Khi sử dụng readiness probe cần lưu ý: 

- Nên define readiness probe cho các pod, ngay cả khi nó là một api đơn giản
- Không dùng để bật tắt pods, vì việc bật tắt pods nên remove tự động hoặc thay đổi dựa trên label.
- Không cần define logic shutdown trong readiness probes define.

***Headless Services***

Headless services là services không có ClusterIP (Vỉrtual IP). Vì vậy khi thực hiện DNS query trên service thay vì trả về ClusterIP như thông thường, nó trả về các PosIP dựa vào Endpoints Resource. 

Headless có thể hiển thị list PodIPs của các pods chưa ready ở thời điểm query bằng config: 

```yaml
annotations:
  service.alpha.kubernetes.io/tolerate-unready-endpoints: "true"
```

***Troubleshooting Services***

Khi không connect được với services nên check theo logic: 

- Check xem truy cập đúng IP chưa, clusterIP chỉ cho phép truy cập từ nội bộ của cluster
- Check xem PodÍPs được bao gồm trong Endpoints của services chưa.
- Check xem truy cập đúng Port chưa.

</details>

<details>
<summary>Volumes</summary>

<!-- bạn paste nội dung vào đây -->

</details>