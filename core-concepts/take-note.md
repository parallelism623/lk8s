 ##### Pods
- ku get pods | wc -l : đếm số lượng pod
- ku get pods -o jsonpath: xem thuộc tính cụ thể theo đường dẫn của pod.
- ku set image pod : cập nhật image của pod cụ thể
- ku run [pod-name] --image= --dry-run=client/server -o yaml > file: tạo template file manifest của pod.
- Khi cần chỉnh s   ửa pod đang tồn tại, dùng: ku get po [pod-name] -o yaml > file cụ thể. Sau đó ghi đè file đó và triển khai instance pod mới.
##### ReplicationController & ReplicaSet & Deployments
- HA: Có thể thay thế pod bị lỗi bằng pod khác có cùng manifest.
- LoadBalancing và Scaling: Dễ dàng thêm hoặc xoá pod.
- ku scale --replicas (trên các resource có properties replicas) để scale số lượng pods
- ku create -f [file] --dry-run=server để validate manifest file
- Deployments: hỗ trợ rolling update 
##### Namespaced
- Một group của các namespaced resource
- ku get pods [podName] -A để list các pod có tên podName của toàn bộ cluster
- DNS trong cùng namespace k cần chỉ định suffix: [namespace].svc.cluster.local, ngược lại cần full DNS
##### Services
- NodePort: 
  - Mở một port trên các worker nodes. 
  - Cho phép redirect request từ port đấy tới các pods có labels khớp với selector trong services.
  - Valid port range: 30000 - 32767
- ClusterIP:
  - Cho phép truy cập các backing pods bằng Cluster IP cố định. 
  - Cho phép các baking pods move around, scale up, scale down.
##### ConfigMaps

- envFrom: get list các env từ source cụ thể.
- env/envFrom: load khi pod tạo → k thể thay đổi, update phải delete pod → tạo mới.
- sử dụng volumne mount với config map sau đó pod mount tới volumne khi: data file
    
    hoặc data cần update realtime.
    

##### Secrets

- sử dụng helm secrets để làm secret an toàn hơn.

##### Resources Request/Limit

- Pods có thể chỉ ra resource tối thiểu (request) và tối đa (limit)
- CPU có thể throttled
- Memory không thể thu hồi khi đang sử dụng ⇒ OOM kill

##### ServiceAccount

- Cho phép các services truy cập tài nguyên trong cluster
- Trước 1.22, token được tạo tự động
- Mỗi namespaced có một SA default
- Flow authen/authorization: Pod → token → API Server → Check SA.
##### Pod States
- Pending: đợi để được lên lịch deploy
- ContainerCreating: bắt đầu deploy
- Running: ok
##### Pod Conditions
- PodScheduled: True khi đươc schedule ngược lại Fale.
- Initialized: True khi init containers chạy xong, ngược lại False
- ContainersReady: True khi tất cả container Ready
- Ready: True khi application trong Pod sẵn sàng nhận request   
##### Readiness and Liveness Probes
- Readiness cho biết containers sẵn sàng nhận request hay chưa thông qua http, tcp hoặc exec command.
- Liveness cho biết bản thân app chạy trong containers còn sống hay không? Từ đó cho phép k8s gửi SIGTERM hoặc SIGKILL nếu liveness death tránh trường hợp looping gây tốn tài nguyênk get pods


#### Taints and Tolerations

- Taints effect:
    - NoSchedule: k schedule nếu k có tolerant
    - PreferNoSchedule: ưu tiên schedule node k có taints nếu k còn node nào thì schedule node này
    - NoExecute: tương tự như NoSchedule nhưng các pod đang chạy k có tolerant cũng bị evict.

#### Node Selector, Node Affinity

- Node selector lựa chọn node nơi pod deploy
- Node affinity énsủe pod được deploy trên node cụ thể.

#### Deployments

- k rollout history: list các revision
- k rollou undo: roll back về revision trước đó, --to-revision dể chỉ định roll back revision destination

#### Job & CronJobs

- Job chạy các pod để thực hiện các task.
- CronJobs lên lịch chạy các job định kì.

#### Network Polices

- Kiểm soát ingress/egress traffic của port thông qua rules.
- Network policy được gắn cho pod dựa trên label và selectors.
- Các rule trong network policy cùng dựa trên label và selectors hoặc port.
- CNI là network solution, cung cấp virtual network cho phép các pod connect với nhau.
- Các CNI enabled network policy thì network policy rule mới áp dụng.

#### Docker Layer

- Layer của docker image khi build chỉ lưu các thay đổi so với layer trước.
- Các layer được pull từ registry nếu k có ở local
- container filesystem = readonly (image layer files) + container layer file system (writable)
- storage drivers được docker lựa chọn phụ thuộc vào OS của host cho phép nó hoạt động hiệu quả dưới Layer architecture
- volumne drivers cho phép tạo các volumne. container mount với các volume để giữ data persistence sau khi nó bị xoá đi.

#### Kube config

- Sử dụng cluster và user information để tạo contexts. Sử dụng context để kết nối tới cluster
- Authorizer:
    - Node: sử dụng để authorization cho kubelet
    - ABAC
    - RBAC: sử dụng Role hoặc ClusterRole đã binding để authorization
    - Webhook: gọi ra external services để authorization
- Admission controler: mutate hoặc validate object. Admission controller có buit in hoặc custom thông qua: MutatingWebhookConfiguration hoặc ValidatingWebhookConfiguration

#### Helm

- Một service có thể gồm nhiều resources instances
- Helm giúp cài đặt một service như là một package manager
- Helm install chart và merge với config do user cung cấp để chạy một release của service
- helm install <>: install svc
- helm upgrade: upgrade svc
- helm rollback: roll back
- helm uninstall: gỡ app.
- helm search hub <name> tìm chart phù hợp trên public hub.
- helm repo add <name> <link> để add chart từ các nguồn khác nhau vào local.
- helm list repo: các charts (text) local
- helm list: list các release. có thể uninstall để gỡ khỏi cluster
- helm pull —untar chartName: pull về nhưng k tạo release.

#### Kustomize

- kustomize cho phép tạo ra manifest từ các overlays manifest và base config.
- giúp sử dụng các manifest gần như giống nhau trên các namespaced khác nhau.
- Properties:
    - commonLabel: thêm label chung cho toàn bộ resources
    - namePrefix/Suffix: thêm vào trước hoặc sau tên của toàn bộ resources
    - namespace: thêm namespace chung cho toàn bộ resources
    - commonAnonotations: thêm annotations chung
    - images: cho phép thay đổi image cùng tên với images.name bằng newName hoặc newTag.
    - patches
    - overlays
    - components