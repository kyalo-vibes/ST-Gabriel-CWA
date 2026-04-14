import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const membersData = [
  { id: 'm-001', name: 'Monicah Wambui', phone: '+254706544095', email: 'monicah.wambui@gmail.com', join_date: '2025-01-10', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-002', name: 'Mary Wanjiru', phone: '+254743818633', email: 'mary.wanjiru@email.com', join_date: '2025-01-15', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-003', name: 'Grace Njeri', phone: '+254X34567890', email: 'grace.njeri@email.com', join_date: '2025-02-01', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-004', name: 'Rose Akinyi', phone: '+254X45678901', email: 'rose.akinyi@email.com', join_date: '2025-02-10', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-005', name: 'Lucy Wambui', phone: '+254X56789012', email: 'lucy.wambui@email.com', join_date: '2025-02-15', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-006', name: 'Faith Adhiambo', phone: '+254X67890123', email: 'faith.adhiambo@email.com', join_date: '2025-03-01', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-007', name: 'Sarah Nyambura', phone: '+254X78901234', email: 'sarah.nyambura@email.com', join_date: '2025-03-10', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-008', name: 'Rebecca Wangari', phone: '+254X89012345', email: 'rebecca.wangari@email.com', join_date: '2025-03-20', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-009', name: 'Esther Muthoni', phone: '+254X90123456', email: 'esther.muthoni@email.com', join_date: '2025-04-01', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-010', name: 'Hannah Njoki', phone: '+254X01234567', email: 'hannah.njoki@email.com', join_date: '2025-04-10', status: 'Inactive', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-011', name: 'Priscilla Auma', phone: '+254X12345679', email: 'priscilla.auma@email.com', join_date: '2025-04-20', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-012', name: 'Margaret Wairimu', phone: '+254X23456780', email: 'margaret.wairimu@email.com', join_date: '2025-05-01', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-013', name: 'Elizabeth Chebet', phone: '+254X34567891', email: 'elizabeth.chebet@email.com', join_date: '2025-05-10', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-014', name: 'Catherine Awino', phone: '+254X45678902', email: 'catherine.awino@email.com', join_date: '2025-05-20', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-015', name: 'Anne Mumbi', phone: '+254X56789013', email: 'anne.mumbi@email.com', join_date: '2025-06-01', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-016', name: 'Lydia Njambi', phone: '+254X67890124', email: 'lydia.njambi@email.com', join_date: '2025-06-10', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-017', name: 'Ruth Atieno', phone: '+254X78901235', email: 'ruth.atieno@email.com', join_date: '2025-06-20', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-018', name: 'Eunice Wanjiku', phone: '+254X89012346', email: 'eunice.wanjiku@email.com', join_date: '2025-07-01', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-019', name: 'Florence Jepkorir', phone: '+254X90123457', email: 'florence.jepkorir@email.com', join_date: '2025-07-10', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-020', name: 'Agnes Nyokabi', phone: '+254X01234568', email: 'agnes.nyokabi@email.com', join_date: '2025-07-20', status: 'Inactive', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-021', name: 'Beatrice Onyango', phone: '+254X12345670', email: 'beatrice.onyango@email.com', join_date: '2025-08-01', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-022', name: 'Josephine Wangui', phone: '+254X23456781', email: 'josephine.wangui@email.com', join_date: '2025-08-10', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-023', name: 'Winnie Moraa', phone: '+254X34567892', email: 'winnie.moraa@email.com', join_date: '2025-08-20', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-024', name: 'Violet Cheptoo', phone: '+254X45678903', email: 'violet.cheptoo@email.com', join_date: '2025-09-01', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-025', name: 'Alice Wacera', phone: '+254X56789014', email: 'alice.wacera@email.com', join_date: '2025-09-10', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-026', name: 'Peris Akoth', phone: '+254X67890125', email: 'peris.akoth@email.com', join_date: '2025-09-20', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-027', name: 'Caroline Mukami', phone: '+254X78901236', email: 'caroline.mukami@email.com', join_date: '2025-10-01', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-028', name: 'Monica Apiyo', phone: '+254X89012347', email: 'monica.apiyo@email.com', join_date: '2025-10-10', status: 'Inactive', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-029', name: 'Pauline Wanjala', phone: '+254X90123458', email: 'pauline.wanjala@email.com', join_date: '2024-11-01', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-030', name: 'Rachael Kemunto', phone: '+254X01234569', email: 'rachael.kemunto@email.com', join_date: '2024-11-10', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-031', name: 'Phoebe Cherotich', phone: '+254X12345671', email: 'phoebe.cherotich@email.com', join_date: '2024-11-20', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-032', name: 'Joyce Wambui', phone: '+254X23456782', email: 'joyce.wambui@email.com', join_date: '2024-12-01', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-033', name: 'Gladys Nyaga', phone: '+254X34567893', email: 'gladys.nyaga@email.com', join_date: '2024-12-10', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-034', name: 'Mercy Achieng', phone: '+254X45678904', email: 'mercy.achieng@email.com', join_date: '2024-12-20', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-035', name: 'Charity Njoki', phone: '+254X56789015', email: 'charity.njoki@email.com', join_date: '2024-10-01', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-036', name: 'Doreen Jeptanui', phone: '+254X67890126', email: 'doreen.jeptanui@email.com', join_date: '2024-10-10', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-037', name: 'Miriam Waithera', phone: '+254X78901237', email: 'miriam.waithera@email.com', join_date: '2024-10-20', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-038', name: 'Stella Atieno', phone: '+254X89012348', email: 'stella.atieno@email.com', join_date: '2024-09-01', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-039', name: 'Damaris Chepkoech', phone: '+254X90123459', email: 'damaris.chepkoech@email.com', join_date: '2024-09-10', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-040', name: 'Nancy Wangeci', phone: '+254X01234560', email: 'nancy.wangeci@email.com', join_date: '2024-09-20', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-041', name: 'Phyllis Anyango', phone: '+254X12345672', email: 'phyllis.anyango@email.com', join_date: '2024-08-01', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-042', name: 'Susan Kariuki', phone: '+254X23456783', email: 'susan.kariuki@email.com', join_date: '2024-08-10', status: 'Inactive', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-043', name: 'Tabitha Jemutai', phone: '+254X34567894', email: 'tabitha.jemutai@email.com', join_date: '2024-08-20', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-044', name: 'Veronica Wamboi', phone: '+254X45678905', email: 'veronica.wamboi@email.com', join_date: '2024-07-01', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-045', name: 'Edith Adhiambo', phone: '+254X56789016', email: 'edith.adhiambo@email.com', join_date: '2024-07-10', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-046', name: 'Lilian Chepchirchir', phone: '+254X67890127', email: 'lilian.chepchirchir@email.com', join_date: '2024-07-20', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-047', name: 'Irene Njeri', phone: '+254X78901238', email: 'irene.njeri@email.com', join_date: '2024-06-01', status: 'Active', jumuia: 'St. Joseph', approvalStatus: 'Approved' },
  { id: 'm-048', name: 'Betty Akinyi', phone: '+254X89012349', email: 'betty.akinyi@email.com', join_date: '2024-06-10', status: 'Active', jumuia: 'St. Peter', approvalStatus: 'Approved' },
  { id: 'm-049', name: 'Cecilia Jepkemoi', phone: '+254X90123450', email: 'cecilia.jepkemoi@email.com', join_date: '2024-06-20', status: 'Active', jumuia: 'St. Mary', approvalStatus: 'Approved' },
  { id: 'm-050', name: 'Diana Wanjiru', phone: '+254X01234561', email: 'diana.wanjiru@email.com', join_date: '2024-05-01', status: 'Active', jumuia: 'St. Paul', approvalStatus: 'Approved' },
  { id: 'm-051', name: 'Patricia Wairimu', phone: '+254X12345673', email: 'patricia.wairimu@email.com', join_date: '2025-10-20', status: 'Pending', jumuia: 'St. Peter', approvalStatus: 'Pending' },
  { id: 'm-052', name: 'Angela Awuor', phone: '+254X23456784', email: 'angela.awuor@email.com', join_date: '2025-10-22', status: 'Pending', jumuia: 'St. Mary', approvalStatus: 'Pending' },
  { id: 'm-053', name: 'Christine Jepkogei', phone: '+254X34567895', email: 'christine.jepkogei@email.com', join_date: '2025-10-24', status: 'Pending', jumuia: 'St. Joseph', approvalStatus: 'Pending' },
];

const contributionsData = [
  { id: 'c-001', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-01-15', reference: 'REF001' },
  { id: 'c-002', member_id: 'm-002', amount: 1500, type: 'Monthly Contribution', date: '2024-01-15', reference: 'REF002' },
  { id: 'c-003', member_id: 'm-003', amount: 1000, type: 'Monthly Contribution', date: '2024-02-15', reference: 'REF003' },
  { id: 'c-004', member_id: 'm-004', amount: 2000, type: 'Monthly Contribution', date: '2024-02-15', reference: 'REF004' },
  { id: 'c-005', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-02-15', reference: 'REF005' },
  { id: 'c-006', member_id: 'm-005', amount: 500, type: 'Monthly Contribution', date: '2024-02-20', reference: 'REF006' },
  { id: 'c-007', member_id: 'm-006', amount: 1500, type: 'Monthly Contribution', date: '2024-03-05', reference: 'REF007' },
  { id: 'c-008', member_id: 'm-007', amount: 1000, type: 'Monthly Contribution', date: '2024-03-15', reference: 'REF008' },
  { id: 'c-009', member_id: 'm-008', amount: 1000, type: 'Monthly Contribution', date: '2024-03-20', reference: 'REF009' },
  { id: 'c-010', member_id: 'm-009', amount: 1500, type: 'Monthly Contribution', date: '2024-04-05', reference: 'REF010' },
  { id: 'c-011', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-03-15', reference: 'REF011' },
  { id: 'c-012', member_id: 'm-002', amount: 1500, type: 'Monthly Contribution', date: '2024-02-15', reference: 'REF012' },
  { id: 'c-013', member_id: 'm-010', amount: 1000, type: 'Monthly Contribution', date: '2024-04-15', reference: 'REF013' },
  { id: 'c-014', member_id: 'm-011', amount: 2000, type: 'Monthly Contribution', date: '2024-04-20', reference: 'REF014' },
  { id: 'c-015', member_id: 'm-012', amount: 500, type: 'Monthly Contribution', date: '2024-05-05', reference: 'REF015' },
  { id: 'c-016', member_id: 'm-013', amount: 2000, type: 'Monthly Contribution', date: '2024-05-15', reference: 'REF016' },
  { id: 'c-017', member_id: 'm-014', amount: 1500, type: 'Monthly Contribution', date: '2024-05-20', reference: 'REF017' },
  { id: 'c-018', member_id: 'm-015', amount: 1000, type: 'Monthly Contribution', date: '2024-06-05', reference: 'REF018' },
  { id: 'c-019', member_id: 'm-016', amount: 1000, type: 'Monthly Contribution', date: '2024-06-15', reference: 'REF019' },
  { id: 'c-020', member_id: 'm-017', amount: 1500, type: 'Monthly Contribution', date: '2024-06-20', reference: 'REF020' },
  { id: 'c-021', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-04-15', reference: 'REF021' },
  { id: 'c-022', member_id: 'm-018', amount: 1500, type: 'Monthly Contribution', date: '2024-07-05', reference: 'REF022' },
  { id: 'c-023', member_id: 'm-019', amount: 1000, type: 'Monthly Contribution', date: '2024-07-15', reference: 'REF023' },
  { id: 'c-024', member_id: 'm-020', amount: 500, type: 'Monthly Contribution', date: '2024-07-20', reference: 'REF024' },
  { id: 'c-025', member_id: 'm-021', amount: 2000, type: 'Monthly Contribution', date: '2024-08-05', reference: 'REF025' },
  { id: 'c-026', member_id: 'm-022', amount: 1000, type: 'Monthly Contribution', date: '2024-08-15', reference: 'REF026' },
  { id: 'c-027', member_id: 'm-023', amount: 1500, type: 'Monthly Contribution', date: '2024-08-20', reference: 'REF027' },
  { id: 'c-028', member_id: 'm-024', amount: 1000, type: 'Monthly Contribution', date: '2024-09-05', reference: 'REF028' },
  { id: 'c-029', member_id: 'm-025', amount: 2000, type: 'Monthly Contribution', date: '2024-09-15', reference: 'REF029' },
  { id: 'c-030', member_id: 'm-026', amount: 1000, type: 'Monthly Contribution', date: '2024-09-20', reference: 'REF030' },
  { id: 'c-031', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-05-15', reference: 'REF031' },
  { id: 'c-032', member_id: 'm-027', amount: 1500, type: 'Monthly Contribution', date: '2024-10-05', reference: 'REF032' },
  { id: 'c-033', member_id: 'm-028', amount: 500, type: 'Monthly Contribution', date: '2024-10-15', reference: 'REF033' },
  { id: 'c-034', member_id: 'm-029', amount: 2500, type: 'Special Contribution', date: '2023-11-05', reference: 'REF034' },
  { id: 'c-035', member_id: 'm-030', amount: 1000, type: 'Monthly Contribution', date: '2023-11-15', reference: 'REF035' },
  { id: 'c-036', member_id: 'm-031', amount: 1500, type: 'Monthly Contribution', date: '2023-11-20', reference: 'REF036' },
  { id: 'c-037', member_id: 'm-032', amount: 1500, type: 'Monthly Contribution', date: '2023-12-05', reference: 'REF037' },
  { id: 'c-038', member_id: 'm-033', amount: 1000, type: 'Monthly Contribution', date: '2023-12-15', reference: 'REF038' },
  { id: 'c-039', member_id: 'm-034', amount: 2000, type: 'Monthly Contribution', date: '2023-12-20', reference: 'REF039' },
  { id: 'c-040', member_id: 'm-035', amount: 1000, type: 'Monthly Contribution', date: '2023-10-05', reference: 'REF040' },
  { id: 'c-041', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-06-15', reference: 'REF041' },
  { id: 'c-042', member_id: 'm-036', amount: 1500, type: 'Monthly Contribution', date: '2023-10-15', reference: 'REF042' },
  { id: 'c-043', member_id: 'm-037', amount: 500, type: 'Monthly Contribution', date: '2023-10-20', reference: 'REF043' },
  { id: 'c-044', member_id: 'm-038', amount: 2000, type: 'Monthly Contribution', date: '2023-09-05', reference: 'REF044' },
  { id: 'c-045', member_id: 'm-039', amount: 1000, type: 'Monthly Contribution', date: '2023-09-15', reference: 'REF045' },
  { id: 'c-046', member_id: 'm-040', amount: 1500, type: 'Monthly Contribution', date: '2023-09-20', reference: 'REF046' },
  { id: 'c-047', member_id: 'm-041', amount: 1500, type: 'Monthly Contribution', date: '2023-08-05', reference: 'REF047' },
  { id: 'c-048', member_id: 'm-042', amount: 1000, type: 'Monthly Contribution', date: '2023-08-15', reference: 'REF048' },
  { id: 'c-049', member_id: 'm-043', amount: 2500, type: 'Special Contribution', date: '2023-08-20', reference: 'REF049' },
  { id: 'c-050', member_id: 'm-044', amount: 1000, type: 'Monthly Contribution', date: '2023-07-05', reference: 'REF050' },
  { id: 'c-051', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-07-15', reference: 'REF051' },
  { id: 'c-052', member_id: 'm-045', amount: 1500, type: 'Monthly Contribution', date: '2023-07-15', reference: 'REF052' },
  { id: 'c-053', member_id: 'm-046', amount: 1000, type: 'Monthly Contribution', date: '2023-07-20', reference: 'REF053' },
  { id: 'c-054', member_id: 'm-047', amount: 2000, type: 'Monthly Contribution', date: '2023-06-05', reference: 'REF054' },
  { id: 'c-055', member_id: 'm-048', amount: 1000, type: 'Monthly Contribution', date: '2023-06-15', reference: 'REF055' },
  { id: 'c-056', member_id: 'm-049', amount: 1500, type: 'Monthly Contribution', date: '2023-06-20', reference: 'REF056' },
  { id: 'c-057', member_id: 'm-050', amount: 2500, type: 'Special Contribution', date: '2023-05-05', reference: 'REF057' },
  { id: 'c-058', member_id: 'm-002', amount: 1500, type: 'Monthly Contribution', date: '2024-03-15', reference: 'REF058' },
  { id: 'c-059', member_id: 'm-003', amount: 1000, type: 'Monthly Contribution', date: '2024-03-15', reference: 'REF059' },
  { id: 'c-060', member_id: 'm-004', amount: 2000, type: 'Monthly Contribution', date: '2024-03-15', reference: 'REF060' },
  { id: 'c-061', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-08-15', reference: 'REF061' },
  { id: 'c-062', member_id: 'm-005', amount: 1000, type: 'Monthly Contribution', date: '2024-03-20', reference: 'REF062' },
  { id: 'c-063', member_id: 'm-006', amount: 1500, type: 'Monthly Contribution', date: '2024-04-05', reference: 'REF063' },
  { id: 'c-064', member_id: 'm-007', amount: 1000, type: 'Monthly Contribution', date: '2024-04-15', reference: 'REF064' },
  { id: 'c-065', member_id: 'm-008', amount: 1000, type: 'Monthly Contribution', date: '2024-04-20', reference: 'REF065' },
  { id: 'c-066', member_id: 'm-009', amount: 1500, type: 'Monthly Contribution', date: '2024-05-05', reference: 'REF066' },
  { id: 'c-067', member_id: 'm-010', amount: 1000, type: 'Monthly Contribution', date: '2024-05-15', reference: 'REF067' },
  { id: 'c-068', member_id: 'm-011', amount: 2000, type: 'Monthly Contribution', date: '2024-05-20', reference: 'REF068' },
  { id: 'c-069', member_id: 'm-012', amount: 1000, type: 'Monthly Contribution', date: '2024-06-05', reference: 'REF069' },
  { id: 'c-070', member_id: 'm-013', amount: 2000, type: 'Monthly Contribution', date: '2024-06-15', reference: 'REF070' },
  { id: 'c-071', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-09-15', reference: 'REF071' },
  { id: 'c-072', member_id: 'm-014', amount: 1500, type: 'Monthly Contribution', date: '2024-06-20', reference: 'REF072' },
  { id: 'c-073', member_id: 'm-015', amount: 1000, type: 'Monthly Contribution', date: '2024-07-05', reference: 'REF073' },
  { id: 'c-074', member_id: 'm-016', amount: 1000, type: 'Monthly Contribution', date: '2024-07-15', reference: 'REF074' },
  { id: 'c-075', member_id: 'm-017', amount: 1500, type: 'Monthly Contribution', date: '2024-07-20', reference: 'REF075' },
  { id: 'c-076', member_id: 'm-018', amount: 1500, type: 'Monthly Contribution', date: '2024-08-05', reference: 'REF076' },
  { id: 'c-077', member_id: 'm-019', amount: 1000, type: 'Monthly Contribution', date: '2024-08-15', reference: 'REF077' },
  { id: 'c-078', member_id: 'm-020', amount: 1000, type: 'Monthly Contribution', date: '2024-08-20', reference: 'REF078' },
  { id: 'c-079', member_id: 'm-021', amount: 2000, type: 'Monthly Contribution', date: '2024-09-05', reference: 'REF079' },
  { id: 'c-080', member_id: 'm-022', amount: 1000, type: 'Monthly Contribution', date: '2024-09-15', reference: 'REF080' },
  { id: 'c-081', member_id: 'm-001', amount: 1000, type: 'Monthly Contribution', date: '2024-10-15', reference: 'REF081' },
  { id: 'c-082', member_id: 'm-023', amount: 1500, type: 'Monthly Contribution', date: '2024-09-20', reference: 'REF082' },
  { id: 'c-083', member_id: 'm-024', amount: 1000, type: 'Monthly Contribution', date: '2024-10-05', reference: 'REF083' },
  { id: 'c-084', member_id: 'm-025', amount: 2000, type: 'Monthly Contribution', date: '2024-10-15', reference: 'REF084' },
  { id: 'c-085', member_id: 'm-026', amount: 1000, type: 'Monthly Contribution', date: '2024-10-20', reference: 'REF085' },
  { id: 'c-086', member_id: 'm-002', amount: 1500, type: 'Monthly Contribution', date: '2024-04-15', reference: 'REF086' },
  { id: 'c-087', member_id: 'm-003', amount: 1000, type: 'Monthly Contribution', date: '2024-04-15', reference: 'REF087' },
  { id: 'c-088', member_id: 'm-004', amount: 2000, type: 'Monthly Contribution', date: '2024-04-15', reference: 'REF088' },
  { id: 'c-089', member_id: 'm-005', amount: 1000, type: 'Monthly Contribution', date: '2024-04-20', reference: 'REF089' },
  { id: 'c-090', member_id: 'm-006', amount: 1500, type: 'Monthly Contribution', date: '2024-05-05', reference: 'REF090' },
  { id: 'c-091', member_id: 'm-002', amount: 1500, type: 'Monthly Contribution', date: '2024-05-15', reference: 'REF091' },
  { id: 'c-092', member_id: 'm-007', amount: 1000, type: 'Monthly Contribution', date: '2024-05-15', reference: 'REF092' },
  { id: 'c-093', member_id: 'm-008', amount: 1000, type: 'Monthly Contribution', date: '2024-05-20', reference: 'REF093' },
  { id: 'c-094', member_id: 'm-009', amount: 1500, type: 'Monthly Contribution', date: '2024-06-05', reference: 'REF094' },
  { id: 'c-095', member_id: 'm-010', amount: 1000, type: 'Monthly Contribution', date: '2024-06-15', reference: 'REF095' },
  { id: 'c-096', member_id: 'm-002', amount: 1500, type: 'Monthly Contribution', date: '2024-06-15', reference: 'REF096' },
  { id: 'c-097', member_id: 'm-011', amount: 2000, type: 'Monthly Contribution', date: '2024-06-20', reference: 'REF097' },
  { id: 'c-098', member_id: 'm-003', amount: 1000, type: 'Monthly Contribution', date: '2024-05-15', reference: 'REF098' },
  { id: 'c-099', member_id: 'm-004', amount: 2000, type: 'Monthly Contribution', date: '2024-05-15', reference: 'REF099' },
  { id: 'c-100', member_id: 'm-002', amount: 1500, type: 'Monthly Contribution', date: '2024-07-15', reference: 'REF100' },
];

const expensesData = [
  { description: 'Medical assistance for Sister Grace', amount: 15000, category: 'Welfare', date: '2024-10-15', reference: 'EXP001' },
  { description: 'Church event supplies', amount: 8500, category: 'Event', date: '2024-10-10', reference: 'EXP002' },
  { description: 'Development project materials', amount: 25000, category: 'Development', date: '2024-10-05', reference: 'EXP003' },
  { description: 'Administrative costs', amount: 5000, category: 'Administrative', date: '2024-09-28', reference: 'EXP004' },
  { description: 'Welfare support for Sister Mary', amount: 12000, category: 'Welfare', date: '2024-09-20', reference: 'EXP005' },
];

const eventsData = [
  { id: 'evt-001', title: 'Monthly Contribution — March 2026', type: 'Monthly', amountPerMember: 500, dueDate: '2026-03-31', targetJumuia: 'All', status: 'Active', description: 'Regular monthly contribution for March 2026.' },
  { id: 'evt-002', title: "Bereavement — Mary Kamau's Mother", type: 'Bereavement', amountPerMember: 300, dueDate: '2026-04-05', targetJumuia: 'All', status: 'Active', description: "Contribution towards the burial expenses for Mary Kamau's late mother." },
  { id: 'evt-003', title: 'Headscarf Project 2025', type: 'Special', amountPerMember: 200, dueDate: '2025-12-31', targetJumuia: 'All', status: 'Closed', description: 'Special levy for purchasing new headscarves for all CWA members.' },
];

const approvedMemberIds = Array.from({ length: 50 }, (_, i) => `m-${String(i + 1).padStart(3, '0')}`);

function buildPayments(eventId: string, amount: number, paidCount: number, paidDate: string) {
  return approvedMemberIds.map((memberId, i) => {
    const paid = i < paidCount;
    return {
      eventFrontendId: eventId,
      memberFrontendId: memberId,
      amountDue: amount,
      amountPaid: paid ? amount : 0,
      status: paid ? 'Paid' : 'Pending',
      paidDate: paid ? paidDate : undefined,
    };
  });
}

const eventPaymentsData = [
  ...buildPayments('evt-001', 500, 30, '2026-03-15'),
  ...buildPayments('evt-002', 300, 15, '2026-03-22'),
  ...buildPayments('evt-003', 200, 50, '2025-12-20'),
];

const notificationsData = [
  { member_id: 'm-010', message: 'Dear Hannah, this is a reminder that your monthly contribution of KES 2,000 is due. Please make your payment at your earliest convenience. Thank you!', date: '2024-10-20', type: 'Payment Reminder' },
  { member_id: 'm-020', message: 'Dear Agnes, this is a reminder that your monthly contribution of KES 3,000 is overdue. Kindly settle your balance to keep your account active. Thank you!', date: '2024-10-18', type: 'Payment Reminder' },
  { member_id: 'm-028', message: 'Dear Monica, this is a reminder that your monthly contribution of KES 4,000 is overdue. Please make your payment as soon as possible. Thank you!', date: '2024-10-15', type: 'Payment Reminder' },
  { member_id: 'all', message: 'Dear Members, we will be having our monthly meeting on October 28, 2024 at 2:00 PM at the church hall. Please make every effort to attend. God bless!', date: '2024-10-12', type: 'Meeting Reminder' },
  { member_id: 'm-042', message: 'Dear Susan, this is a reminder that your monthly contribution of KES 3,000 is overdue. We kindly request you to settle your balance. Thank you!', date: '2024-10-10', type: 'Payment Reminder' },
  { member_id: 'all', message: 'Dear Members, contributions for October are now due. Please make your payments by the 25th to avoid late fees. God bless you all!', date: '2024-10-05', type: 'General Reminder' },
  { member_id: 'm-005', message: 'Dear Lucy, this is a reminder that your monthly contribution of KES 2,500 is due. Please make your payment at your earliest convenience. Thank you!', date: '2024-09-28', type: 'Payment Reminder' },
  { member_id: 'all', message: 'Dear Members, thank you all for your generous contributions in September. We have successfully raised KES 45,000 for our community welfare projects. God bless!', date: '2024-09-25', type: 'Thank You' },
  { member_id: 'm-012', message: 'Dear Margaret, this is a reminder that your monthly contribution of KES 3,500 is overdue. Kindly settle your balance soon. Thank you!', date: '2024-09-20', type: 'Payment Reminder' },
  { member_id: 'all', message: 'Dear Members, we will be organizing a fundraising event for Sister Jane who is unwell. Please keep her in your prayers and contribute what you can. God bless!', date: '2024-09-15', type: 'Fundraising' },
];

function toJumuia(raw: string): 'ST_PETER' | 'ST_PAUL' | 'ST_JOSEPH' | 'ST_MARY' {
  const map: Record<string, any> = {
    'St. Peter': 'ST_PETER',
    'St. Paul': 'ST_PAUL',
    'St. Joseph': 'ST_JOSEPH',
    'St. Mary': 'ST_MARY',
  };
  if (!map[raw]) throw new Error(`Unknown jumuia: ${raw}`);
  return map[raw];
}

function toMemberStatus(raw: string): 'ACTIVE' | 'INACTIVE' | 'PENDING' {
  const map: Record<string, any> = { Active: 'ACTIVE', Inactive: 'INACTIVE', Pending: 'PENDING' };
  if (!map[raw]) throw new Error(`Unknown status: ${raw}`);
  return map[raw];
}

function toApprovalStatus(raw: string): 'PENDING' | 'APPROVED' | 'REJECTED' {
  const map: Record<string, any> = { Approved: 'APPROVED', Pending: 'PENDING', Rejected: 'REJECTED' };
  if (!map[raw]) throw new Error(`Unknown approvalStatus: ${raw}`);
  return map[raw];
}

function toEventType(raw: string): 'BEREAVEMENT' | 'WEDDING' | 'SCHOOL_FEES' | 'MONTHLY' | 'HARAMBEE' | 'SPECIAL' {
  const map: Record<string, any> = {
    Monthly: 'MONTHLY',
    Bereavement: 'BEREAVEMENT',
    Wedding: 'WEDDING',
    'School Fees': 'SCHOOL_FEES',
    Harambee: 'HARAMBEE',
    Special: 'SPECIAL',
  };
  if (!map[raw]) throw new Error(`Unknown eventType: ${raw}`);
  return map[raw];
}

function toEventStatus(raw: string): 'ACTIVE' | 'CLOSED' {
  return raw === 'Active' ? 'ACTIVE' : 'CLOSED';
}

function toPaymentStatus(raw: string): 'PENDING' | 'PAID' {
  return raw === 'Paid' ? 'PAID' : 'PENDING';
}

async function main() {
  console.log('Seeding database...');

  // --- MEMBERS ---
  const defaultPasswordHash = await bcrypt.hash('CWA2026', 10);
  const memberIdMap = new Map<string, string>();
  for (const m of membersData) {
    const created = await prisma.member.upsert({
      where: { email: m.email },
      update: {},
      create: {
        name: m.name,
        phone: m.phone,
        email: m.email,
        joinDate: new Date(m.join_date),
        status: toMemberStatus(m.status) as any,
        jumuia: toJumuia(m.jumuia) as any,
        approvalStatus: toApprovalStatus(m.approvalStatus) as any,
        passwordHash: defaultPasswordHash,
      },
    });
    memberIdMap.set(m.id, created.id);
  }
  console.log(`  Members: ${memberIdMap.size}`);

  // --- EXPENSES ---
  await prisma.expense.createMany({
    data: expensesData.map((e) => ({
      description: e.description,
      amount: e.amount,
      category: e.category,
      date: new Date(e.date),
      reference: e.reference,
    })),
    skipDuplicates: true,
  });
  console.log(`  Expenses: ${expensesData.length}`);

  // --- CONTRIBUTIONS ---
  await prisma.contribution.createMany({
    data: contributionsData.map((c) => {
      const memberId = memberIdMap.get(c.member_id);
      if (!memberId) throw new Error(`Missing member mapping: ${c.member_id}`);
      return {
        memberId,
        amount: c.amount,
        type: c.type,
        date: new Date(c.date),
        reference: c.reference,
      };
    }),
    skipDuplicates: true,
  });
  console.log(`  Contributions: ${contributionsData.length}`);

  // --- EVENTS ---
  const eventIdMap = new Map<string, string>();
  for (const e of eventsData) {
    const created = await prisma.contributionEvent.create({
      data: {
        title: e.title,
        type: toEventType(e.type) as any,
        amountPerMember: e.amountPerMember,
        dueDate: new Date(e.dueDate),
        targetJumuia: e.targetJumuia,
        status: toEventStatus(e.status) as any,
        description: e.description,
      },
    });
    eventIdMap.set(e.id, created.id);
  }
  console.log(`  Events: ${eventIdMap.size}`);

  // --- EVENT PAYMENTS ---
  await prisma.eventPayment.createMany({
    data: eventPaymentsData.map((p) => {
      const eventId = eventIdMap.get(p.eventFrontendId);
      const memberId = memberIdMap.get(p.memberFrontendId);
      if (!eventId) throw new Error(`Missing event mapping: ${p.eventFrontendId}`);
      if (!memberId) throw new Error(`Missing member mapping: ${p.memberFrontendId}`);
      return {
        eventId,
        memberId,
        amountDue: p.amountDue,
        amountPaid: p.amountPaid,
        status: toPaymentStatus(p.status) as any,
        paidDate: p.paidDate ? new Date(p.paidDate) : null,
      };
    }),
    skipDuplicates: true,
  });
  console.log(`  Event Payments: ${eventPaymentsData.length}`);

  // --- NOTIFICATIONS ---
  await prisma.notification.createMany({
    data: notificationsData.map((n) => {
      const memberId = n.member_id === 'all' ? undefined : memberIdMap.get(n.member_id);
      if (n.member_id !== 'all' && !memberId) throw new Error(`Missing member mapping: ${n.member_id}`);
      return {
        memberId,
        message: n.message,
        type: n.type,
        sentAt: new Date(n.date),
      };
    }),
  });
  console.log(`  Notifications: ${notificationsData.length}`);

  // --- ADMINS ---
  const adminData = [
    {
      name: 'CWA Treasurer',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@stgabriel.org',
      password: process.env.SEED_ADMIN_PASSWORD,
    },
    {
      name: 'CWA Chairlady',
      email: process.env.SEED_CHAIRLADY_EMAIL || 'chairlady@stgabriel.org',
      password: process.env.SEED_CHAIRLADY_PASSWORD,
    },
  ];

  if (adminData.some((a) => !a.password)) {
    throw new Error(
      'SEED_ADMIN_PASSWORD and SEED_CHAIRLADY_PASSWORD must be set in .env before seeding admins.',
    );
  }

  for (const admin of adminData) {
    const passwordHash = await bcrypt.hash(admin.password, 10);
    await prisma.admin.upsert({
      where: { email: admin.email },
      create: { name: admin.name, email: admin.email, passwordHash },
      update: {},
    });
  }
  console.log(`  Admins: ${adminData.length}`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
